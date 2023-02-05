import { useRouter } from 'next/router'

const HomePage = ({ ethAddress }) => {
  const router = useRouter();
  const mySecret = process.env.ADDRESS;

  const createVault = () => {
    console.log(123);
    console.log(mySecret);
    router.push('/CreateVault');
  };

  return (
    <div>
      <h1>Your Ethereum address</h1>
      <p>{ethAddress}</p>
      <button onClick={createVault}>
        Create a vault
      </button>
    </div>
  )
}

HomePage.getInitialProps = async ({ query }) => {
  const ethAddress = query.ethAddress || null

  return { ethAddress }
}

export default HomePage;