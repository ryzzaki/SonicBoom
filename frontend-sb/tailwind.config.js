const sizes = {
  '1': '1px',
  '2': '2px',
  '3': '3px',
  '4': '4px',
  '5': '5px',
  '6': '6px',
  '7': '7px',
  '8': '8px',
  '9': '9px',
  '10': '10px',
  '11': '11px',
  '12': '12px',
  '13': '13px',
  '14': '14px',
  '15': '15px',
  '16': '16px',
  '17': '17px',
  '18': '18px',
  '19': '19px',
  '20': '20px',
  '22': '22px',
  '24': '24px',
  '25': '25px',
  '26': '26px',
  '28': '28px',
  '30': '30px',
  '32': '32px',
  '34': '34px',
  '35': '35px',
  '36': '36px',
  '38': '38px',
  '40': '40px',
  '60': '60px',
  '80': '80px',
  '100': '100px',
  '200': '200px',
  '5rem': '5rem',
  '10rem': '10rem',
  '15rem': '15rem',
  '20rem': '20rem',
  '30rem': '30rem',
};

const insets = {
  '1/2': '50%',
  '0': '0',
  '-2': '-2rem',
  '-3': '-3rem',
  '0.5': '0.5rem',
  '1': '1rem',
  '3': '3rem',
  '4': '4rem',
  '5': '5rem',
};

const flex = {
  '1': '1',
  '2': '2',
  auto: 'auto',
};

module.exports = {
  prefix: '',
  important: false,
  separator: ':',
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    colors: {
      transparent: 'transparent',
      white: '#fff',
      grey: '#5c595f',
      greylight: '#95949c',
      black: '#000',
      black2: '#100e1c',
      black2light: '#1d1b28',
      blue: '#1483ff',
      pink: '#f3a0bd',
    },
    fontSize: sizes,
    fontFamily: {
      logoHeading: ['NexaBold', 'sans-serif'],
      heading: ['GothamMedium', 'sans-serif'],
      body: ['MetropolisLight', 'sans-serif'],
      mono: ['NexaBold', 'sans-serif'],
    },
    extend: {
      spacing: sizes,
    },
    maxWidth: sizes,
    minWidth: sizes,
    inset: insets,
    flex: flex,
  },
  variants: {
    textColor: ['group-hover'],
    opacity: ['group-hover'],
  },
  plugins: [],
};
