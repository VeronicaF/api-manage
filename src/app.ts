import React from 'react'
import why from '@welldone-software/why-did-you-render'

export const dva = {
  config: {
    onError(err: ErrorEvent) {
      // err.preventDefault();
      // console.error(err.message);
    },
  },
};

process.env.API_ENV === 'dev' && why(React)
