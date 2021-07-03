// NOTE: `tfjs` needs to be loaded for `tfjs-automl` to work
import '@tensorflow/tfjs';

import React from 'react';

import { loadObjectDetection } from '@tensorflow/tfjs-automl';

import { BoundingBox } from './useImages';

async function loadModel() {
  const model = await loadObjectDetection(
    '/models/tf_js-manu_images_v2/model.json'
  );
  return model;
}

export const useManuAI = ({
  imageRef,
}: {
  imageRef: React.RefObject<HTMLImageElement>;
}) => {
  const [loading, setLoading] = React.useState(false);
  const [manuAIDetectedBoxes, setManuAIDetectedBoxes] = React.useState<
    Array<{ score: number; bBox: BoundingBox }>
  >([]);

  const handleDetect = async () => {
    const img = imageRef.current;
    if (!img) {
      return;
    }

    setLoading(true);
    const imgWidth = img.width;
    const imgHeight = img.height;

    console.log('Loading model...');
    const model = await loadModel();

    console.log('Running predictions...');
    const predictions = await model.detect(img, {
      score: 0.5,
      iou: 0.5,
      topk: 5,
    });

    console.log(predictions);
    setManuAIDetectedBoxes(
      predictions.map((prediction) => ({
        score: prediction.score,
        bBox: {
          x1: prediction.box.left / imgWidth,
          y1: prediction.box.top / imgHeight,
          x2: (prediction.box.left + prediction.box.width) / imgWidth,
          y2: (prediction.box.top + prediction.box.height) / imgHeight,
        },
      }))
    );
    setLoading(false);
  };

  const manuAIButton = <button onClick={handleDetect}>MANU AI</button>;

  return {
    manuAIButton,
    manuAIDetectedBoxes,
    resetManuAiBoxes: () => setManuAIDetectedBoxes([]),
    manuAILoading: loading,
  };
};