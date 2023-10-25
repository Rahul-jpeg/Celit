import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod';
import { INFINTE_QUERY_LIMIT } from '@/config';
import { absoluteUrl } from '@/lib/utils';
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe';
import { PLANS } from '@/config/stripe';

export const appRouter = router({
    // authCallback procedure
    authCallback: publicProcedure.query(async () => {
        const { getUser } = getKindeServerSession()
        const user = getUser()

        if (!user.id || !user.email) throw new TRPCError({ code: 'UNAUTHORIZED' })

        // Check if the user in database
        const dbUser = await db.user.findFirst({
            where: {
                id: user.id,
            },
        })

        if (!dbUser) {
            await db.user.create({
                data: {
                    id: user.id,
                    email: user.email,
                },
            })
        }

        return { success: true };
    }),
    // procedure to get the files
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { userId, user } = ctx

        return await db.file.findMany({
            where: {
                userId
            }
        })
    }),
    // procedure to delete a file
    deleteFile: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
        const { userId } = ctx;

        const file = await db.file.findFirst({
            where: {
                id: input.id,
                userId,
            },
        })

        if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

        await db.file.delete({
            where: {
                id: input.id,
            },
        })
        return file;
    }),
    // prodcedure to get the file
    getFile: privateProcedure.input(z.object({ key: z.string() })).mutation(async ({ ctx, input }) => {
        const { userId } = ctx;
        const file = await db.file.findFirst({
            where: {
                key: input.key,
                userId,
            },
        })
        if (!file) throw new TRPCError({ code: 'NOT_FOUND' })
        return file;
    }),
    // procedure to get the upload status of a file
    getFileUploadStatus: privateProcedure.input(z.object({ fileId: z.string() })).query(async ({ ctx, input }) => {
        const file = await db.file.findFirst({
            where: {
                id: input.fileId,
                userId: ctx.userId,
            }
        })
        if (!file) return { status: "PENDING" as const }
        return { status: file.uploadStatus }
    }),
    // procedure to get the messages of a file
    getFileMessages: privateProcedure.input(z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
    })).query(async ({ ctx, input }) => {
        const { cursor, fileId } = input;
        const { userId } = ctx;
        const limit = input.limit ?? INFINTE_QUERY_LIMIT
        const file = db.file.findFirst({
            where: {
                id: fileId,
                userId
            }
        })
        if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

        const messages = await db.message.findMany({
            take: limit + 1,
            where: {
                fileId
            },
            orderBy: {
                createdAt: 'desc'
            },
            cursor: cursor ? { id: cursor } : undefined,
            select: {
                id: true,
                isUserMessage: true,
                createdAt: true,
                text: true,
            }
        })
        let nextCursor: typeof cursor | undefined = undefined;
        if (messages.length > limit) {
            const nextItem = messages.pop();
            nextCursor = nextItem?.id;
        }
        return { messages, nextCursor }
    }),
    // 
    createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
        const { userId } = ctx;
        const billingUrl = absoluteUrl('/dashboard/billing')
        if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' })
        const dbUser = await db.user.findFirst({
            where: {
                id: userId
            }
        })
        if (!dbUser) throw new TRPCError({ code: 'UNAUTHORIZED' })

        const subscriptionPlan = await getUserSubscriptionPlan()

        if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: dbUser.stripeCustomerId,
                return_url: billingUrl,
            })
            return { url: stripeSession.url }
        }

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: billingUrl,
            cancel_url: billingUrl,
            payment_method_types: ['card'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            line_items: [{
                price: PLANS.find((plan) => plan.name === 'Pro')?.price.priceIds.test,
                quantity: 1
            }],
            metadata: {
                userId: userId
            }
        })

        return { url: stripeSession.url }
    }),
})


export type AppRouter = typeof appRouter;