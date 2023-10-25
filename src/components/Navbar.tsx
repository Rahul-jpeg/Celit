import { cn } from '@/lib/utils';
import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from '@kinde-oss/kinde-auth-nextjs/server';
import { Fragment_Mono } from 'next/font/google';
import Link from 'next/link';
import MaxWidthWrapper from './MaxWidthWrapper';
import { buttonVariants } from './ui/button';
import UserAccountNav from './UserAccountNav';
import { ArrowRight } from 'lucide-react';

const fragmentMono = Fragment_Mono({
  weight: '400',
  subsets: ['latin'],
});
type NavbarProps = {};

const Navbar = (props: NavbarProps) => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray- bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href={'/'} className="flex z-40 text-xl">
            <span className={fragmentMono.className}>
              Celit.
            </span>
          </Link>
          {/* TODO : Mobile Navbar */}

          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <Link
                  href={'/pricing'}
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}
                >
                  Pricing
                </Link>
                <LoginLink
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}
                >
                  Sign in
                </LoginLink>
                <RegisterLink
                  className={cn(
                    buttonVariants({
                      variant: 'default',
                      size: 'sm',
                    }),
                    'bg-zinc-700 text-white hover:bg-zinc-600',
                  )}
                >
                  Register
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  href={'/dashboard'}
                  className={buttonVariants({
                    variant: 'default',
                    size: 'sm',
                  })}
                >
                  Dashboard
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
                <UserAccountNav
                  name={
                    !user.given_name || !user.family_name
                      ? 'Your Account'
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ''}
                  imageUrl={user.picture ?? ''}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
