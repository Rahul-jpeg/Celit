import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';

type DashboardProps = {};

const page = (props: DashboardProps) => {
  const { getUser } = getKindeServerSession();
  const user = getUser();
  return <div></div>;
};

export default page;
