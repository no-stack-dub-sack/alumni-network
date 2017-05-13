import React from 'react';
import axios from 'axios';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import Social from './Profile/Preferences/Social';
import UserLabel from '../dashboard/common/UserLabel';
import PersonalInfo from './Profile/Preferences/PersonalInfo';
import SkillsAndInterests from './Profile/Preferences/SkillsAndInterests';
import { saveUser, updateUser, updateUserPartial } from '../../actions/user';
import Certifications from './Profile/Preferences/Certifications';
import Collaboration from './Profile/Preferences/Collaboration';
import { countryCodes } from '../../assets/dropdowns/countries';
import { savePreferencesViewState } from '../../actions/views';
import { ThickPaddedBottom } from '../../styles/globalStyles';
import Modal from './Profile/Preferences/common/SaveModal';
import Mentorship from './Profile/Preferences/Mentorship';
import { connectScreenSize } from 'react-screen-size';
import Career from './Profile/Preferences/Career';
import { mapScreenSizeToProps } from '../Navbar';
import { Button } from 'semantic-ui-react';
import styled from 'styled-components';
import Validator from 'validator';
import { isEmpty } from 'lodash';

/*
TODO:
  - PERSONAL INFO: validation to require user to enter country to collect data for D3 map?
  - GENERAL: Refactor validation code, kind of reduntant and could be improved (isPageValid && isSectionValid)
*/

const TopButton = styled(Button)`
  height: 42px !important;
  padding: 10px !important;
  @media (max-width: 959px) {
    margin-top: 10px !important;
  }
  @media (min-width: 959px) {
    float: right !important;
  }
`;

const BottomButton = styled(Button)`
  right: 0;
  bottom: 35px;
`;

const Container = styled(ThickPaddedBottom)`
  @media (max-width: 770px) {
    padding: 0 10px 50px 10px !important;
  }
`;

class Preferences extends React.Component {
  constructor(props) {
    super(props);
    const { user, viewState } = this.props;
    this.state = {
      user,
      viewState,
      errors: {},
      modalOpen: false,
      isPageValid: true,
      profileWarning: '',
      socialPopUp: false,
      careerPopUp: false,
      projectsPopUp: false,
      personalPopUp: false,
      mentorshipPopUp: false,
      showBottomButton: false,
      skillsAndInterestsPopUp: false,
      skillsOptions: [],
      interestsOptions: [],
    }
    // SHARED ERRORS:
    this.EMAIL_ERROR = "Please enter a valid email address."
    this.LOCATION_ERROR = "Location must be 25 characters or less.";
    this.DISPLAY_NAME_ERROR = "Display name must be 40 characters or less.";
    this.CAREER_ERROR = "Please complete the entire section or clear the form."
    this.CODEPEN_ERROR = "Please enter your username only, not your profile url.";
    this.MENTORSHIP_ERROR = "To complete your mentorship prorgram enrollment, please fill out the section above.";
  }

  componentDidMount() {
    document.addEventListener('scroll', this.handleScroll);
    // populate skills dropdown with modified data
    axios.post('/api/populate-dropdown', { id: 'coreSkills' })
      .then(res => {
        const { items } = res.data;
        this.setState({ skillsOptions: items });
    });
    // populate interests dropdown with modified data
    axios.post('/api/populate-dropdown', { id: 'codingInterests' })
      .then(res => {
        const { items } = res.data;
        this.setState({ interestsOptions: items });
    });
  }

  componentWillUnmount() {
    this.props.savePreferencesViewState(this.state.viewState);
    document.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = (e) => {
    if (e.target.scrollingElement.scrollTop >= 60) {
      this.setState({ showBottomButton: true });
    } else {
      this.setState({ showBottomButton: false });
    }
  }

  toggleMentorship = (bool, id) => {
    var { user } = this.state;
    if (id === 'mentorship') {
      user.mentorship.isMentor = bool;
    } else {
      user.mentorship.isMentee = bool;
    }
    this.setState({ user });
  }

  handleSkillsChange = (e, { value }) => {
    var { user } = this.state;
    user.skillsAndInterests.coreSkills = value;
    this.setState({ user });
  }

  handleInterestsChange = (e, { value }) => {
    var { user } = this.state;
    user.skillsAndInterests.codingInterests = value;
    this.setState({ user });
  }

  handleSkillsAddition = (e, { value }) => {
    const { skillsOptions } = this.state;
    this.setState({
      skillsOptions: [{ key: value, text: value, value }, ...skillsOptions],
    });
    // save item to dropdown collection on server
    axios.post('/api/add-dropdown-item',
      { id: 'coreSkills', item: { key: value, text: value, value } }
    );
  }

  handleInterestsAddition = (e, { value }) => {
    const { interestsOptions } = this.state;
    this.setState({
      interestsOptions: [{ key: value, text: value, value }, ...interestsOptions],
    });
    // save item to dropdown collection on server
    axios.post('/api/add-dropdown-item',
      { id: 'codingInterests', item: { key: value, text: value, value } }
    );
  }

  handleCountryChange = (e, data) => {
    var { user } = this.state;
    user.personal.flag = data.value;
    user.personal.country = countryCodes[data.value.replace(' ', '_')];
    this.setState({ user });
  }

  handleTenureChange = (e, data) => {
    var { user } = this.state;
    user.career.tenure = data.value;
    this.setState({ user });
  }

  handleRadioChange = (e) => {
    var { user } = this.state;
    if (e.target.name === 'working') {
      if (e.target.id === 'Yes') {
        user.career.jobSearch = '';
        user.career.working = 'yes';
      } else if (e.target.id === 'No') {
        user.career.tenure = '';
        user.career.company = '';
        user.career.working = 'no';
      }
    }
    if (e.target.name === 'jobSearch') {
      user.career.jobSearch = e.target.id.replace(/_/g, ' ');
    }
    this.setState({ user });
  }

  handleInputChange = (e) => {
    var { user, errors } = this.state;
    var { name, value } = e.target;
    errors[name] = '';

    if (name === 'company') user.career.company = value;
    else if (name === 'codepen') user.social.codepen = value;
    else if (name === 'email') user.personal.email.email = value;
    else if (name === 'mentorshipSkills' ) {
      if (this.isSectionValid(name, value))
        user.mentorship.mentorshipSkills = value;
    } else {
      if (this.isSectionValid(name, value))
        user.personal[name] = value;
    }

    this.setState({ user, errors });
  }

  saveProjectsList = (items_list) => {
    var { user } = this.state;
    user.projects = items_list;
    this.setState({ user });
  }

  toggleEmailVisibilty = () => {
    var { user } = this.state;
    if (user.personal.email.private)
    user.personal.email.private = false;
    else user.personal.email.private = true;
    this.setState({ user });
  }

  saveChanges = (modal) => {
    if (this.isPageValid()) {
      updateUser(this.state.user).then(res => {
        const { updatedUser } = res.data;
        this.props.saveUser(updatedUser);
        modal && this.setState({ modalOpen: true });
      }).catch(err => console.log(err));
    } else {
      modal && this.setState({ modalOpen: true }, () => {
        var { viewState } = this.state;
        // open sections that have errors if they are closed
        if (this.state.errors.email)
          viewState.showProfile = true;
        if (this.state.errors.career)
          viewState.showCareer = true;
        if (this.state.errors.mentorshipSkills)
          viewState.showMentorship = true;
        this.setState({ viewState });
      });
    }
  }

  // now saves only section user clicks button for
  handleSubSaveClick = (e) => {
    e.stopPropagation();
    e.persist();
    const { user, user: { _id } } = this.state;
    const section = e.target.id.slice(0, -5);
    if (this.isSectionValid(section)) {
      updateUserPartial(_id, section, user[section]).then(res => {
        const { updatedUser } = res.data;
        this.props.saveUser(updatedUser);
        // open "Saved" popup
        this.setState({ [e.target.id]: true });
        // close popup 1 second later
        setTimeout( _ => this.resetPopUp(e.target.id), 1200);
      }).catch(err => console.log(err));
    }
  }

  isSectionValid = (section, str) => {
    this.setState({ errors: {} });
    var errors = {};

    const {
      user: {
        social: { codepen },
        personal: { email: { email }, location, displayName },
        mentorship: { isMentor, isMentee, mentorshipSkills },
        career: { working, tenure, company, jobSearch },
      }
    } = this.state;

    // SECTION VALIDATIONS (called on handleSubSaveClick)
    if (section === 'career') {
      if (working && working === 'no' && (!tenure || !jobSearch)) {
        errors.career = this.CAREER_ERROR;
      }
      if (working && working === 'yes' && (!tenure || !company)) {
        errors.career = this.CAREER_ERROR;
      }
    }
    if (section === 'social' && codepen && Validator.isURL(codepen)) {
      errors.codepen = this.CODEPEN_ERROR;
    }
    if (section === 'personal') {
      if (email && !Validator.isEmail(email)) {
        errors.email = this.EMAIL_ERROR;
      }
      // these 2 seem reduntant but are needed in case pre-loaded github data
      // breaks validatiion rules - no onChange error since not manually typed
      if (!Validator.isLength(location, { min: 0, max: 25 })) {
        errors.location = this.LOCATION_ERROR;
      }
      if (!Validator.isLength(displayName, { min: 0, max: 40 })) {
        errors.displayName = this.DISPLAY_NAME_ERROR;
      }
    }
    if (section === 'mentorship' && (isMentee || isMentor) && !mentorshipSkills) {
      errors.mentorshipSkills = this.MENTORSHIP_ERROR;
    }

    // ONCHANGE VALIDATIONS (called on handleInputChange change)
    if (section === 'location' && !Validator.isLength(str, { min: 0, max: 25 })) {
      errors.location = this.LOCATION_ERROR;
    }
    if (section === 'bio' && !Validator.isLength(str, { min: 0, max: 300 })) {
      errors.bio = "Bio must be 300 characters or less.";
    }
    if (section === 'displayName' && !Validator.isLength(str, { min: 0, max: 40 })) {
      errors.displayName = "Display name must be 40 characters or less.";
    }
    if (section === 'mentorshipSkills' && !Validator.isLength(str, { min: 0, max: 200 })) {
      errors.mentorshipSkills = "Mentorshio bio must be 200 characters or less.";
    }

    if (isEmpty(errors)) {
      return true;
    } else {
      this.setState({ errors });
      return false;
    }
  }

  isPageValid = () => {
    this.setState({ errors: {} });
    var errors = {};
    var profileStrength = 0;

    const { user: {
        social: { codepen },
        career: { working, tenure, company, jobSearch },
        skillsAndInterests: { codingInterests, coreSkills },
        mentorship: { isMentor, isMentee, mentorshipSkills },
        personal: { displayName, email: { email }, bio, country, location },
      }
    } = this.state;

    if (email && !Validator.isEmail(email)) {
      errors.email = this.EMAIL_ERROR;
    }
    if (codepen && Validator.isURL(codepen)) {
      errors.codepen = this.CODEPEN_ERROR;
    }
    if ((isMentee || isMentor) && !mentorshipSkills) {
      errors.mentorshipSkills = this.MENTORSHIP_ERROR;
    }
    if (working && working === 'yes' && (!tenure || !company)) {
      errors.career = this.CAREER_ERROR;
    }
    if (working && working === 'no' && (!tenure || !jobSearch)) {
      errors.career = this.CAREER_ERROR;
    }
    if (location && !Validator.isLength(location, { min: 0, max: 25 })) {
      errors.location = this.LOCATION_ERROR;
    }
    if (displayName && !Validator.isLength(displayName, { min: 0, max: 40 })) {
      errors.displayName = this.DISPLAY_NAME_ERROR;
    }

    if (bio) profileStrength++;
    if (country) profileStrength++;
    if (location) profileStrength++;

    if (isEmpty(codingInterests) && isEmpty(coreSkills)) {
      this.setState({ profileWarning: 'Stronger profiles make for a stronger and more effective community — consider telling us about your skills and interests so other members know what you rock at!' });
    } else if (!working) {
      this.setState({ profileWarning: 'Stronger profiles make for a stronger and more effective community — consider telling us about where you are in your programming career so other members will know how long you\'ve been coding for!' });
    } else if (profileStrength < 3) {
      this.setState({ profileWarning: 'Nice work! Your profile is looking pretty strong. Why not round it off with some information about yourself (bio, region, etc.) so other members can learn more about you?' });
    }

    if (isEmpty(errors)) {
      this.setState({ isPageValid: true });
      return true;
    } else {
      this.setState({ errors, isPageValid: false });
      return false;
    }
  }

  closeModal = () => {
    this.setState({ modalOpen: false });
  }

  resetPopUp = (id) => {
    this.setState({ [id]: false });
  }

  clearSocialInput = (site) => {
    var { user } = this.state;
    user.social[site] = '';
    this.setState({ user }, () => {
      updateUser(user).then(res => {
        const { updatedUser } = res.data;
        this.props.saveUser(updatedUser);
      });
    });
  }

  clearCareerForm = () => {
    var { user, errors } = this.state;
    user.career.working = '';
    user.career.tenure = '';
    user.career.jobSearch = '';
    user.career.company = '';
    errors.career = '';
    this.setState({ user, errors });
  }

  toggle = (target) => {
    const { viewState } = this.state;
    /* we pass callback to setState to catch state after update
      in case all the modals are now open or closed */
    viewState[target] = !viewState[target];
    this.setState({ viewState }, () => {
      if (
        !viewState.showFCC &&
        !viewState.showSkills &&
        !viewState.showSocial &&
        !viewState.showCareer &&
        !viewState.showProfile &&
        !viewState.showMentorship &&
        !viewState.showCollaboration
      ) {
          viewState.showAll = false;
          this.setState({ viewState });
      } else if (
        viewState.showFCC &&
        viewState.showSocial &&
        viewState.showSkills &&
        viewState.showCareer &&
        viewState.showProfile &&
        viewState.showMentorship &&
        viewState.showCollaboration
      ) {
          viewState.showAll = true;
          this.setState({ viewState });
      }
    });
  }

  toggleAll = () => {
    var { viewState, viewState: { showAll } } = this.state;
    viewState.showAll = !showAll;
    viewState.showFCC = !showAll;
    viewState.showCareer = !showAll;
    viewState.showSkills = !showAll;
    viewState.showSocial = !showAll;
    viewState.showProfile = !showAll;
    viewState.showMentorship = !showAll;
    viewState.showCollaboration = !showAll;
    this.setState({ viewState });
  }

  render() {

    const {
      errors,
      user: {
        social,
        career,
        personal,
        username,
        mentorship,
        skillsAndInterests,
      },
    } = this.state;

    const { isDesktop } = this.props.screen;

    return (
      <Container className="ui container">
        <Modal
          size="small"
          close={this.closeModal}
          open={this.state.modalOpen}
          isValid={this.state.isPageValid}
          warning={this.state.isPageValid && this.state.profileWarning} />
        <UserLabel
          size="huge"
          username={username}
          image={personal.avatarUrl}
          toggleAll={this.toggleAll}
          folder={isDesktop ? this.state.viewState.showAll : ''}
          label={!isDesktop ? '' : mentorship.mentor ? 'Mentor' : 'Member'} />
        <TopButton
          icon="save"
          size="large"
          color="green"
          content="Save"
          labelPosition="right"
          onClick={this.saveChanges} />
          {/* floated prop throws invalid propType warning - expects only 'right' or 'left' */}
        <div className="ui raised segment">
          <PersonalInfo
            {...personal}
            errors={errors}
            toggle={this.toggle}
            country={personal.flag}
            email={personal.email.email}
            isPrivate={personal.email.private}
            showPopUp={this.state.personalPopUp}
            subSaveClick={this.handleSubSaveClick}
            handleInputChange={this.handleInputChange}
            showProfile={this.state.viewState.showProfile}
            toggleEmailVisibilty={this.toggleEmailVisibilty}
            handleCountryChange={this.handleCountryChange} />
          <Certifications
            toggle={this.toggle}
            fccCerts={this.state.user.fccCerts}
            showFCC={this.state.viewState.showFCC} />
          <Mentorship
            {...mentorship}
            toggle={this.toggle}
            error={errors.mentorshipSkills}
            subSaveClick={this.handleSubSaveClick}
            showPopUp={this.state.mentorshipPopUp}
            toggleMentorship={this.toggleMentorship}
            toggleMenteeship={this.toggleMenteeship}
            handleInputChange={this.handleInputChange}
            handleRadioChange={this.handleRadioChange}
            showMentorship={this.state.viewState.showMentorship} />
          <SkillsAndInterests
            toggle={this.toggle}
            {...skillsAndInterests}
            subSaveClick={this.handleSubSaveClick}
            skillsOptions={this.state.skillsOptions}
            showSkills={this.state.viewState.showSkills}
            handleSkillsChange={this.handleSkillsChange}
            interestsOptions={this.state.interestsOptions}
            showPopUp={this.state.skillsAndInterestsPopUp}
            handleSkillsAddition={this.handleSkillsAddition}
            handleInterestsChange={this.handleInterestsChange}
            handleInterestsAddition={this.handleInterestsAddition} />
          <Collaboration
            username={username}
            toggle={this.toggle}
            saveChanges={this.saveChanges}
            projects={this.state.user.projects}
            showPopUp={this.state.projectsPopUp}
            subSaveClick={this.handleSubSaveClick}
            saveProjectsList={this.saveProjectsList}
            showCollaboration={this.state.viewState.showCollaboration} />
          <Social
            {...social}
            errors={errors}
            toggle={this.toggle}
            clear={this.clearSocialInput}
            saveChanges={this.saveChanges}
            showPopUp={this.state.socialPopUp}
            subSaveClick={this.handleSubSaveClick}
            handleInputChange={this.handleInputChange}
            showSocial={this.state.viewState.showSocial} />
          <Career
            {...career}
            errors={errors}
            toggle={this.toggle}
            clearForm={this.clearCareerForm}
            showPopUp={this.state.careerPopUp}
            subSaveClick={this.handleSubSaveClick}
            handleInputChange={this.handleInputChange}
            handleRadioChange={this.handleRadioChange}
            showCareer={this.state.viewState.showCareer}
            handleTenureChange={this.handleTenureChange}
            bigBottomMargin={this.state.showBottomButton} />
       { this.state.showBottomButton &&
         <BottomButton
            icon="save"
            color="green"
            content="Save"
            floated="right"
            labelPosition="right"
            onClick={this.saveChanges} /> }
        </div>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    viewState: state.profileViewState
  }
}

Preferences.propTypes = {
  viewState: propTypes.object,
  user: propTypes.object.isRequired,
}

export default connectScreenSize(mapScreenSizeToProps)(
  connect(mapStateToProps, { saveUser, savePreferencesViewState })(Preferences)
);
