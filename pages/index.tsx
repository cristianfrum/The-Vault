import React from 'react'
import { useRouter } from 'next/router'

const IndexPage = () => {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/Login');
  }, []);

  return (
    <div>
    </div>
  );
}

export default IndexPage;