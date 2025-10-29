import { useQueryClient } from '@tanstack/react-query';

function ChatError() {
  const queryClient = useQueryClient();
  const mutationState = queryClient
    .getMutationCache()
    .findAll({ mutationKey: ['sendMessage'] })[0];
  const error = mutationState?.state.error;

  if (!error) return null;

  return (
    <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg mb-4">
      {error instanceof Error ? error.message : 'Erreur de connexion'}
    </div>
  );
}

export { ChatError };
