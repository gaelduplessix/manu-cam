import { NextApiRequest, NextApiResponse } from 'next';

import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // NOTE: Not authenticated... Please don't DDOS me!

  const startTime = Date.now();

  // Limit: default 200
  const limit = Math.min(
    parseInt((req.query.limit as string) ?? '') || 200,
    200
  );

  const queryHour =
    typeof req.query.hour === 'string'
      ? `${req.query.hour.replace(' ', 'T')}Z`
      : null;
  const hourFilter = queryHour
    ? {
        time: {
          $gte: new Date(queryHour),
          $lte: new Date(new Date(queryHour).getTime() + 60 * 60 * 1000),
        },
      }
    : {};

  const hasDetectionFilter = req.query.hasManu
    ? { manuDetection: { $ne: null } }
    : {};

  const [images, imagesByHourGroups] = await runDbQuery(async (db) => {
    return Promise.all([
      db
        .collection('images')
        .find({ ...hourFilter, ...hasDetectionFilter })
        .sort({ time: -1 })
        .limit(limit)
        .toArray(),
      db
        .collection('images')
        .aggregate([
          { $match: hasDetectionFilter },
          {
            $project: {
              _id: 1,
              y: { $year: '$time' },
              m: { $month: '$time' },
              d: { $dayOfMonth: '$time' },
              h: { $hour: '$time' },
            },
          },
          {
            $group: {
              _id: { year: '$y', month: '$m', day: '$d', hour: '$h' },
              count: { $sum: 1 },
            },
          },
          {
            $sort: {
              '_id.year': -1,
              '_id.month': -1,
              '_id.day': -1,
              '_id.hour': -1,
            },
          },
        ])
        .toArray(),
    ]);
  });

  const imagesByHour = imagesByHourGroups.map(
    ({ _id: { year, month, day, hour }, count }) => {
      return {
        hour: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
          2,
          '0'
        )} ${String(hour).padStart(2, '0')}:00`,
        count,
      };
    }
  );

  const endTime = Date.now();
  console.log(`[images] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ images, imagesByHour });
};
