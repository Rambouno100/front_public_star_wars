import { useQuery } from '@tanstack/react-query';
import { getPullDetail } from '../api';

export const usePullDetail = id =>
  useQuery({
    queryKey: ['pulls', id],
    queryFn: () => getPullDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
