import OpenAI from 'openai';

export const GPT_MODEL = 'gpt-4o-2024-05-13';
// export const GPT_MODEL = 'gpt-4o-mini';
export const GEODA_AI_ASSISTANT_NAME =
  process.env.NODE_ENV === 'production' ? 'geoda.ai-openai-agent' : 'geoda.ai-openai-agent-dev';
export const GEODA_AI_ASSISTANT_VERSION = '0.0.8';

export const GEODA_AI_ASSISTANT_BODY: OpenAI.Beta.AssistantCreateParams = {
  model: GPT_MODEL,
  name: GEODA_AI_ASSISTANT_NAME,
  description: 'Assistant for geoda.ai',
  instructions:
    "You are a spatial data analyst. You are helping analyzing the spatial  data. You are capable of:\n1. create basic maps and rates maps, including quantile map, natural breaks map, equal intervals map, percentile map, box map with hinge=1.5, box map with hinge=3.0, standard deviation map, and unique values map\n2. create plots or charts, including histogram, scatter plot, box plot, parallel coordinates plot and bubble chart\n3. create spatial weights, including queen contiguity weights, rook contiguity weights, distance based weights and kernel weights\n4. apply local indicators of spatial association (LISA) analysis, including local morn, local G, local G*, local Geary and Quantile LISA\n5. Apply spatial regression analysis, including classic linear regression model with spatial diagnostics if weights provided, spatial lag model and spatial error model \nPlease don't say you are unable to display the actual plot or map directly in this text-based interface.\nPlease don't use LaTex to format text. \nPlease don't ask to load the data to understand its content.\nPlease try to create plot or map for only one variable at a time.\nPlease list first 10 variables if possible.\nFor lisa function, please use the existing spatial weights. If no spatial weights can be found, please ask the user to create spatial weights first.\n Please try to correct the variable name using the metadata of the datasets.",
  tools: [
    {
      type: 'function',
      function: {
        name: 'histogram',
        description:
          'Create a histogram to describe the distribution of a variable by grouping data into bins of equal width. Each bin is plotted as a bar whose height corresponds to how many data points are in that bin.',
        parameters: {
          type: 'object',
          properties: {
            k: {
              type: 'number',
              description:
                'The number of bins or intervals that represent a range of data. Bins are also called intervals, classes, or buckets.'
            },
            variableName: {
              type: 'string',
              description: 'The variable name, which contains numeric values'
            },
            datasetName: {
              type: 'string',
              description:
                'The name of the dataset. If not provided, please try to find the dataset name that contains the variableName.'
            }
          },
          required: ['k', 'variableName', 'datasetName']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'scatter',
        description:
          'Generate a scatterplot to visualize the relationship between two numerical variables. Each point on the plot corresponds to an observation in the dataset, with the position along the X and Y axes representing the values of the two variables.',
        parameters: {
          type: 'object',
          properties: {
            variableX: {
              type: 'string',
              description:
                'The name of the variable to be plotted along the X-axis, representing the independent variable.'
            },
            variableY: {
              type: 'string',
              description:
                'The name of the variable to be plotted along the Y-axis, representing the dependent variable or the variable of interest.'
            },
            datasetName: {
              type: 'string',
              description:
                'The name of the dataset. If not provided, please try to find the dataset name that contains the variableX and variableY.'
            }
          },
          required: ['variableX', 'variableY', 'datasetName']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'boxplot',
        description:
          'Create box plot, also called box-and-whisker plot, to visually present a summary of numeric variable using the following key elements: minimum value, lower quartile (q1), median value, upper quartile (q3), and maximum value.',
        parameters: {
          type: 'object',
          properties: {
            variableNames: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'A list of the variable names'
            },
            boundIQR: {
              type: 'number',
              description:
                'The multiplier for the IQR to determine outliers. The default value is 1.5. However, a value of 3.0 is common as well. It can also be called hinge value.'
            },
            datasetName: {
              type: 'string',
              description:
                'The name of the dataset. If not provided, please try to find the dataset name that contains the variableNames.'
            }
          },
          required: ['variableNames', 'datasetName']
        }
      }
    },

    {
      type: 'function',
      function: {
        name: 'parallelCoordinate',
        description:
          'Create a parallel coordinate plot(otherwise known as a pcp) to visually identify clusters and patterns in a multi-dimensional variable space. In a PCP, each variable is represented as a (parallel) axis, and each observation consists of a line that connects points on the axes. Clusters are identified as groups of lines (i.e., observations) that follow a similar path.',
        parameters: {
          type: 'object',
          properties: {
            variableNames: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'A list of the variable names'
            },
            datasetName: {
              type: 'string',
              description:
                'The name of the dataset. If not provided, please try to find the dataset name that contains the variableNames.'
            }
          },
          required: ['variableNames', 'datasetName']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'bubble',
        description:
          'Generate a bubble chart to visualize the relationship between two numerical variables with the additional dimension of size, representing a third variable. Each point on the plot corresponds to an observation in the dataset, with the position along the X and Y axes representing the values of the two variables, and the size of each bubble representing the magnitude of the third variable. Optionally, bubbles can also be colored based on another categorical or numerical variable.',
        parameters: {
          type: 'object',
          properties: {
            variableX: {
              type: 'string',
              description:
                'The name of the variable to be plotted along the X-axis, often representing the independent variable.'
            },
            variableY: {
              type: 'string',
              description:
                'The name of the variable to be plotted along the Y-axis, often representing the dependent variable or the variable of interest.'
            },
            variableSize: {
              type: 'string',
              description:
                'The name of the variable to be represented by the size of each bubble, adding a third dimensional analysis to the data visualization.'
            },
            variableColor: {
              type: 'string',
              description:
                'Optionally, the name of the variable to be represented by the color of each bubble, possibly to categorize or further differentiate the data points.'
            },
            datasetName: {
              type: 'string',
              description:
                'The name of the dataset. If not provided, please try to find the dataset name that contains the variableX, variableY, variableSize and variableColor.'
            }
          },
          required: ['variableX', 'variableY', 'variableSize', 'datasetName']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'createMap',
        description:
          'Create a thematic map from a numeric variable by grouping the values into k bins or categories using a specific map classification method. If map classification method is not mentiond, please ask the users to provide one.',
        parameters: {
          type: 'object',
          properties: {
            method: {
              type: 'string',
              description:
                'The name of the map classification method. It should be one of the following methods: quantile, natural breaks, equal interval, percentile, box, standard deviation, unique values. The default name of method is quantile.'
            },
            k: {
              type: 'number',
              description:
                'The number of bins or classes that the numeric values will be groupped into. This property is required by the following classifcation methods: quantile, natural breaks, equal interval, percentile. This property is not required by the following classification methods: box, standard deviation, unique values. The default value of k is 5.'
            },
            variableName: {
              type: 'string',
              description: 'The name of the numeric variable.'
            },
            hinge: {
              type: 'number',
              description:
                'This property is only for classifcation method: box. This numeric value defines the lower and upper edges of the box known as hinges. It could be either 1.5 or 3.0, and the default value is 1.5'
            },
            datasetName: {
              type: 'string',
              description:
                'The name of the dataset. If not provided, please try to find the dataset name that contains the variableName.'
            }
          },
          required: ['method', 'variableName', 'datasetName']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'createVariable',
        description: 'Create a new variable or column.',
        parameters: {
          type: 'object',
          properties: {
            variableName: {
              type: 'string',
              description: 'The name of the new variable or column.'
            },
            dataType: {
              type: 'string',
              description:
                'The data type of the new variable or column. It could be integer, string or real.'
            },
            defaultValue: {
              type: 'string',
              description:
                "The default value that is assigned to the new variable or column. It could be a number, e.g. 0 or 1. It could be a description, e.g. random numbers or normal random. Please return 'uniform_random' for random numbers, return 'normal_random' for normal random numbers."
            },
            expression: {
              type: 'string',
              description:
                'The expression that is used to create the new variable by composing with other variables.  For example, (A + B), or (A / B). Please add round brackets to the expression. Please return the expression within a pair of round brackets.'
            },
            datasetName: {
              type: 'string',
              description:
                'The name of the dataset. If not provided, please try to use the first dataset. Otherwise, please prompt the user to provide the dataset name for the new variable.'
            }
          },
          required: ['dataType', 'variableName', 'datasetName']
        }
      }
    },

    {
      type: 'function',
      function: {
        name: 'createWeights',
        description:
          'Create a spatial weights, which could be k nearest neighbor (knn) weights, queen contiguity weights, rook contiguity weights, distance based weights or kernel weights. Please assume the dataset contains the geometries or coordinates of the observations for weights createion.',
        parameters: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description:
                'The type of spatial weights. It could be knn, queen, rook, distance or kernel.'
            },
            k: {
              type: 'number',
              description:
                'This parameter is only used in k nearest neighbor (knn) weights creation. It represents the number of nearby neighbors that are closest to each observation. The number of k should be larger than 1.'
            },
            orderOfContiguity: {
              type: 'number',
              description:
                'This parameter is only used in queen or rook weights creation. It represents the order or distance of contiguity from each geometry. The default order of contiguity is 1.'
            },
            includeLowerOrder: {
              type: 'boolean',
              description:
                'This parameter is only used in queen or rook weights creation. It represents whether or not the lower order neighbors should be included. The default value is False.'
            },
            precisionThreshold: {
              type: 'number',
              description:
                'This parameter only used in queen or rook weights creation. It represnts the precision threshold that allow for an exact match of coordinates, so we can use it to determine which polygons are neighbors that sharing the proximate coordinates or edges. The default value is 0.'
            },
            distanceThreshold: {
              type: 'number',
              description:
                'This parameter only used in distance based weights creation. It represents the distance threshold used to search nearby neighbors for each geometry. The unit should be either kilometer (KM) or mile.'
            },
            isMile: {
              type: 'boolean',
              description:
                'This parameter only used in distance based weights creation. It represents whether the distance threshold is in mile or not. The default value is False.'
            },
            datasetName: {
              type: 'string',
              description:
                'The name of the dataset. If not provided, please try to use the first dataset name.'
            }
          },
          required: ['type', 'datasetName']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'lisa',
        description:
          'Apply local indicators of spatial association (LISA) statistics, which inlcude local moran, local G, local G*, local Geary and Quantile LISA, to identify local clusters (e.g. hot spots and cold spots) or local spatial outliers of a specific variable and a specific spatial weights. Please do not create spatial weights in this function and only use the existing spatial weights. If no spatial weights can be found, please respond to user to create spatial weights first.',
        parameters: {
          type: 'object',
          properties: {
            method: {
              type: 'string',
              description:
                "The name of the LISA method. It could be one of the following methods: localMoran, localGeary, localG, localGStar, quantileLisa. The localG is for local Getis-Ord's G"
            },
            weightsID: {
              type: 'string',
              description:
                'The weightsID that is mapping to user created spatial weights based on the dataset name, type and properties when creating the spatial weights. If no weightsID can be found, please do not try to create spatial weights, but ask user to create spatial weights first.'
            },
            variableName: {
              type: 'string',
              description: 'The variable name, which contains numeric values'
            },
            multiVariableNames: {
              type: 'array',
              items: {
                type: 'string'
              },
              description:
                "A list of the variable names. This property is only used in multivariate LISA methods: e.g. multivariate local moran. If multivariate LISA is specified, please don't use variableName."
            },
            biVariableNames: {
              type: 'array',
              items: {
                type: 'string'
              },
              description:
                "A list of the variable names. This property is only used in bivariate LISA methods: e.g. bivariate local moran. If bivariate LISA is specified, please don't use variableName."
            },
            permutation: {
              type: 'number',
              description:
                'The number of possible arrangements or permutations in the conditional permutation test carried out in local moran statistics. Default permutation number is 999'
            },
            significanceThreshold: {
              type: 'number',
              description:
                'The significance threshold is a value between 0 and 1 that is used to determine whether a probability is significant or not. Default significant threshold is 0.05'
            },
            datasetName: {
              type: 'string',
              description:
                'The name of the dataset. If not provided, please try to find the dataset name that contains the variableName.'
            }
          },
          required: ['method', 'weightsID', 'variableName', 'datasetName']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'spatialRegression',
        description:
          'Apply spatial regression analysis to find a linear relationship between a dependent variable Y and a set of explanatory or independent variables X. The equation is Y ~ X1 + X2 + ... Xn. If spatial weights is provided, the diagnostics for spatial autocorrelation will be applied. The spatial regression model could be classic, spatial-lag or spatial-error model.',
        parameters: {
          type: 'object',
          properties: {
            independentVariables: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'A list of the independent or explanatory variable names X'
            },
            dependentVariable: {
              type: 'string',
              description: 'The name of dependent variable Y'
            },
            modelType: {
              type: 'string',
              description:
                'The type of regression model. It could be classic, spatial-lag or spatial-error. The default model type is classic. If not provided, please use classic model.'
            },
            weightsId: {
              type: 'string',
              description:
                'The id of the specified spatial weights. For classic model, the optional weightsId is for spatial diagnostics. For spatial-lag and spatial-error model, the weightsId is required. Please prompt user to provide spatial weights if needed.'
            },
            datasetName: {
              type: 'string',
              description:
                'The name of the dataset. If not provided, please try to find the dataset name that contains the independentVariables and dependentVariable.'
            }
          },
          required: ['independentVariables', 'dependentVariable', 'modelType', 'datasetName']
        }
      }
    }
  ],
  metadata: {
    version: GEODA_AI_ASSISTANT_VERSION
  },
  temperature: 0.8,
  top_p: 0.8,
  response_format: 'auto'
};
