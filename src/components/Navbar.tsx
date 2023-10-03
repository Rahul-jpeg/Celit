import { cn } from '@/lib/utils';
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server';
import { Fragment_Mono } from 'next/font/google';
import Link from 'next/link';
import MaxWidthWrapper from './MaxWidthWrapper';
import { buttonVariants } from './ui/button';

const fragmentMono = Fragment_Mono({
  weight: '400',
  subsets: ['latin'],
});
type NavbarProps = {};

const Navbar = (props: NavbarProps) => {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray- bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href={'/'} className="flex z-40 text-xl">
            <span className={fragmentMono.className}>Celit.</span>
          </Link>
          {/* TODO : Mobile Navbar */}

          <div className="hidden items-center space-x-4 sm:flex">
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
                  'bg-blue-200 text-black hover:bg-blue-300',
                )}
              >
                Register
              </RegisterLink>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
