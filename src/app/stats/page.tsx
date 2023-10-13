import { getStats } from '@/lib/pinecone';

const page = () => {
  console.log(getStats());

  return <div>page</div>;
};

export default page;
