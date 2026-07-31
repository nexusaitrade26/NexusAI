import LearnView from '../components/learn/LearnView';

const LearnPage = () => {
  return (
    <div>
      <LearnView isLoading={false} lessons={[]} />
    </div>
  );
};

export default LearnPage;
