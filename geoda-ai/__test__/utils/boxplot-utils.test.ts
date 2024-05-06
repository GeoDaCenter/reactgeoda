import {createBoxplot, CreateBoxplotProps, BoxplotDataProps} from '@/utils/plots/boxplot-utils';

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
          name: 'category1',
          value: [1, 2, 3, 4, 5]
        },
        {
          name: 'category2',
          value: [6, 7, 8, 9, 10]
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
          name: 'category1',
          value: [1, 2, 3, 4, 5]
        },
        {
          name: 'category2',
          value: [6, 7, 8, 9, 10]
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
          name: 'category1',
          value: [1, 2, 3, 4, 5]
        },
        {
          name: 'category2',
          value: [6, 7, 8, 9, 10]
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
          name: 'category1',
          value: [1, 2, 3, 4, 5]
        },
        {
          name: 'category2',
          value: [6, 7, 8, 9, 10]
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
