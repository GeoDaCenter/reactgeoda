import {createBoxplot, CreateBoxplotProps, BoxplotDataProps} from '@/utils/boxplot-utils';

describe('createBoxplot', () => {
  it('should return the correct boxplot data', () => {
    const data: CreateBoxplotProps['data'] = {
      category1: [1, 2, 3, 4, 5],
      category2: [6, 7, 8, 9, 10]
    };
    const boundIQR = 1.5;

    const expected: BoxplotDataProps = {
      boxData: [
        {
          itemName: 'category1',
          low: 1,
          Q1: 2,
          Q2: 3,
          Q3: 4,
          high: 5
        },
        {
          itemName: 'category2',
          low: 6,
          Q1: 7,
          Q2: 8,
          Q3: 9,
          high: 10
        }
      ],
      meanPoint: [],
      visiblePoints: []
    };

    const result = createBoxplot({data, boundIQR});

    expect(result).toEqual(expected);
  });

  it('should handle empty data', () => {
    const data: CreateBoxplotProps['data'] = {};
    const boundIQR = 1.5;

    const expected: BoxplotDataProps = {
      boxData: [],
      meanPoint: [],
      visiblePoints: []
    };

    const result = createBoxplot({data, boundIQR});

    expect(result).toEqual(expected);
  });

  it('should handle data with outliers', () => {
    const data: CreateBoxplotProps['data'] = {
      category1: [1, 2, 3, 4, 5, 100],
      category2: [6, 7, 8, 9, 10, 200]
    };
    const boundIQR = 1.5;

    const expected: BoxplotDataProps = {
      boxData: [
        {
          itemName: 'category1',
          low: 1,
          Q1: 2,
          Q2: 3,
          Q3: 4,
          high: 5
        },
        {
          itemName: 'category2',
          low: 6,
          Q1: 7,
          Q2: 8,
          Q3: 9,
          high: 10
        }
      ],
      outlier: [
        ['category1', 100],
        ['category2', 200]
      ],
      meanPoint: [],
      visiblePoints: []
    };

    const result = createBoxplot({data, boundIQR});

    expect(result).toEqual(expected);
  });

  it('should handle data with mean points', () => {
    const data: CreateBoxplotProps['data'] = {
      category1: [1, 2, 3, 4, 5],
      category2: [6, 7, 8, 9, 10]
    };
    const boundIQR = 1.5;

    const expected: BoxplotDataProps = {
      boxData: [
        {
          itemName: 'category1',
          low: 1,
          Q1: 2,
          Q2: 3,
          Q3: 4,
          high: 5
        },
        {
          itemName: 'category2',
          low: 6,
          Q1: 7,
          Q2: 8,
          Q3: 9,
          high: 10
        }
      ],
      meanPoint: [
        ['category1', 3],
        ['category2', 8]
      ],
      visiblePoints: []
    };

    const result = createBoxplot({data, boundIQR});

    expect(result).toEqual(expected);
  });

  it('should handle data with visible points', () => {
    const data: CreateBoxplotProps['data'] = {
      category1: [1, 2, 3, 4, 5],
      category2: [6, 7, 8, 9, 10]
    };
    const boundIQR = 1.5;

    const expected: BoxplotDataProps = {
      boxData: [
        {
          itemName: 'category1',
          low: 1,
          Q1: 2,
          Q2: 3,
          Q3: 4,
          high: 5
        },
        {
          itemName: 'category2',
          low: 6,
          Q1: 7,
          Q2: 8,
          Q3: 9,
          high: 10
        }
      ],
      meanPoint: [],
      visiblePoints: [
        ['category1', 1],
        ['category1', 5],
        ['category2', 6],
        ['category2', 10]
      ]
    };

    const result = createBoxplot({data, boundIQR});

    expect(result).toEqual(expected);
  });
});
