import useSWR, { SWRConfig } from 'swr';

export interface File {
  name: string;
  mediaLink: string;
}

export interface Image {
  _id: string;
  time: Date;
  files: {
    small: File;
    large: File;
  };
  annotations?: {
    hasManu?: boolean;
    boundingBoxes?: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }>;
  };
  manuDetection?: {
    score: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

interface ImagesByHour {
  hour: string;
  count: number;
}

export const useImages = (
  params: string = ''
): { images: Array<Image>; imagesByHour: Array<ImagesByHour> } => {
  const { data } = useSWR(`/api/images${params}`, {
    onSuccess: (data) => {
      console.log({ data });
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  return { images: data?.images ?? [], imagesByHour: data?.imagesByHour ?? [] };
};

export const useAnnotationImages = (
  params: string = ''
): {
  images: Array<Image>;
  totalCount: number;
  totalMissingAnnotations: number;
  revalidate: () => Promise<boolean>;
  isValidating: boolean;
} => {
  const { data, revalidate, isValidating } = useSWR(
    `/api/annotation-images${params}`,
    {
      onSuccess: (data) => {
        // console.log('annotation-images', { data });
      },
      onError: (error) => {
        console.log('annotation-images', { error });
      },
    }
  );

  return {
    images: data?.images ?? [],
    totalCount: data?.totalCount || 0,
    totalMissingAnnotations: data?.totalMissingAnnotations || 0,
    revalidate,
    isValidating,
  };
};
