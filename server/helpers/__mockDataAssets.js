import axios from 'axios';
import {
  getBackEndCert,
  getDataVisCert,
  getFrontEndCert
} from './getCerts';

export const skills = [
  'Angular',
  'Backbone',
  'C++',
  'CSS',
  'D3',
  'Ember',
  'HTML',
  'Java',
  'Javascript',
  'jQuery',
  'Less',
  'Meteor',
  'MongoDB',
  'Vue',
  'NodeJS',
  'PHP',
  'Python',
  'Rails',
  'React',
  'Ruby',
  'SASS',
  'SQL',
  'ThreeJS',
];

export const interests = [
  'Behavior Driven Development',
  'Big Data / NOSQL',
  'Bitcoin / Digital Currency',
  'Data Science',
  'DevOps',
  'Game Development',
  'Internet of Things (IoT)',
  'Machine Learning / AI',
  'QA / Testing',
  'Test Driven Development',
  'UI Design',
  'User Experience',
  'Virtual / Augmented Reality',
];

export const generate = (type, threshold) => {
  return type.reduce((accum, curr) => {
    return Math.random() < threshold ? accum.concat(curr) : accum;
  }, []);
};

export const fakeUsers = [
  'quincylarson',
  'berkeleytrue',
  'weezlo',
  'mmhansen',
  'forkerino',
  'Margaret2',
  'sjames1958gm',
  'JLuboff',
  'no-stack-dub-sack',
  'bonham000',
  'hkuz',
  'coymeetsworld',
  'p1xt',
  'bengitter',
  'josh5231',
];

export const mentorshipSource = [
  'I want to help people learn to code.',
  'I am really good with D3 and can help people with that',
  'I know React really well and can mentor people in React',
  'I would love to help someone learn about serverside code',
  'I am very good at database design',
  'I would like to mentor someone in creating a full stack app',
  'I can help someone practice algorithms',
  'I would be happy to help someone practice interview questions',
  'I can advise someone on the job search',
  'I am very good with CSS and responsive design',
  'I know Redux very well and can help mentor someone on that',
  'I am really good with Express and Node.',
  'I am great at mobile app design',
  'I am very knowledgeable in Ruby and Rails',
  'I am a Python master and can help you with data science problems'
];


export function randomizeMentorship() {
  const mentorshipSkillsList = [];
  while (mentorshipSource.length > 0) {
    var index = Math.floor(Math.random() * (mentorshipSource.length - 0));
    var bio = mentorshipSource.splice(index, 1);
    mentorshipSkillsList.push(bio);
  }
  return mentorshipSkillsList;
};

export const getCertifications = (username) => {
  return axios.all([
    getFrontEndCert(username),
    getBackEndCert(username),
    getDataVisCert(username)
  ])
  .then(axios.spread((frontCert, backCert, dataCert) => {

    if (username === 'QuincyLarson' || username === 'P1xt') {
      return {
        Back_End: true,
        Data_Visualization: true,
        Front_End: true,
      };
    };

    if ((frontCert.request._redirectCount +
      backCert.request._redirectCount +
      dataCert.request._redirectCount) >= 3 ) {
      return false;
    } else {
      return {
        Back_End: backCert.request._redirectCount === 0 ? true : false,
        Data_Visualization: dataCert.request._redirectCount === 0 ? true : false,
        Front_End: frontCert.request._redirectCount === 0 ? true : false,
      }
    }
  }));
};
