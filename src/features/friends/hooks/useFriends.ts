import { useListFriendsQuery } from "../api/friendsApi";

export function useFriends() {
  const { data, isLoading, isError } = useListFriendsQuery();
  return { friends: data ?? [], isLoading, isError };
}
