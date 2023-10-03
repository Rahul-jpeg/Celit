import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

type DashboardProps = {};

const page = (props: DashboardProps) => {
  const { getUser } = getKindeServerSession();
  const user = getUser();
  return <div></div>;
};

export default page;
