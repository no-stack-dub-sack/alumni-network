import { LoginSegment } from './components/signup/LoginPage';
import React from 'react';
import renderer from 'react-test-renderer';

/*******************************

  Snapshot Tests!

            Snapshot tests...?

                      ¯\_(ツ)_/¯

*******************************/
//
//
/*******************************
  ./components/signup/LoginPage.js
*******************************/
test('loginSegment renders correctly given "isMobile" is true', () => {
  const loginSegment = renderer.create(<LoginSegment isMobile={true} />);
  expect(loginSegment).toMatchSnapshot();
});

test('loginSegment renders correctly given "isMobile" is false', () => {
  const loginSegment = renderer.create(<LoginSegment isMobile={false} />);
  expect(loginSegment).toMatchSnapshot();
});
