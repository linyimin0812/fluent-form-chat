
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatPage from './ChatPage';

const validAgents = ['share-agent', 'share-creation-agent', 'share-test-agent', 'share-qa-agent'];

const Index = () => {
  const { '*': path } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (path) {
      const agentName = path.split('/')[0];
      if (!validAgents.includes(agentName)) {
        navigate('/agents', { replace: true });
        return;
      }
    }
  }, [path, navigate]);

  return <ChatPage />;
};

export default Index;
