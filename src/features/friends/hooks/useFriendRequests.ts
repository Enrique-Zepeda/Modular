import { useListIncomingRequestsQuery, useListOutgoingRequestsQuery } from "../api/friendsApi";

export function useFriendRequests() {
  const incoming = useListIncomingRequestsQuery();
  const outgoing = useListOutgoingRequestsQuery();

  return {
    incoming: incoming.data ?? [],
    outgoing: outgoing.data ?? [],
    isLoading: incoming.isLoading || outgoing.isLoading,
    isError: incoming.isError || outgoing.isError,
  };
}
