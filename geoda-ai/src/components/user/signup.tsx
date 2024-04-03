'use client';

import {useRef, useState, FormEvent} from 'react';
import jsonp from 'jsonp';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import {WarningBox, WarningType} from '../common/warning-box';

export function SignUpModal() {
  // state for user input
  const [email, setEmail] = useState('');
  // state for status of subscription
  const [status, setStatus] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const path =
      'https://gmail.us21.list-manage.com/subscribe/post-json?u=06b2700cae8218b88f097724d&id=6a6f176215&f_id=00dde5e6f0';
    const url = `${path}&EMAIL=${encodeURIComponent(email)}&b_06b2700cae8218b88f097724d_6a6f176215`;

    setStatus('sending');
    jsonp(url, {param: 'c'}, (err, data) => {
      if (data.msg.includes('already subscribed') || data.msg.includes('too many recent signup')) {
        setStatus('duplicate');
      } else if (err) {
        setStatus('error');
      } else if (data.result !== 'success') {
        setStatus('error');
      } else {
        setStatus('success');
      }
    });
  };

  const onInputChange = (e: FormEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value);
  };

  return (
    <div id="signup-modal" style={{padding: '20px'}}>
      <div id="mc_embed_shell">
        <div id="mc_embed_signup">
          <form
            action="https://gmail.us21.list-manage.com/subscribe/post?u=06b2700cae8218b88f097724d&amp;id=6a6f176215&amp;f_id=00dde5e6f0"
            method="post"
            id="mc-embedded-subscribe-form"
            name="mc-embedded-subscribe-form"
            className="validate"
            target="_blank"
            onSubmit={onSubmit}
          >
            <div id="mc_embed_signup_scroll">
              <h2>Sign Up for GeoDa.AI Preview</h2>
              <div className="indicates-required">
                <span className="asterisk">*</span>
                indicates required
              </div>
              <div className="mc-field-group">
                <label htmlFor="mce-EMAIL">
                  Email Address
                  <span className="asterisk">*</span>
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  className="required email"
                  id="mce-EMAIL"
                  value={email}
                  onChange={onInputChange}
                />
                <span id="mce-EMAIL-HELPERTEXT" className="helper_text"></span>
              </div>
              <div id="mce-responses" className="clear foot">
                <div className="response" id="mce-error-response" style={{display: 'none'}}></div>
                <div className="response" id="mce-success-response" style={{display: 'none'}}></div>
              </div>
              <div aria-hidden="true" style={{position: 'absolute', left: '-5000px'}}>
                <input
                  type="text"
                  name="b_06b2700cae8218b88f097724d_6a6f176215"
                  value=""
                  readOnly
                />
              </div>
              <div className="optionalParent">
                <div className="clear foot">
                  <input
                    type="submit"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                    className="button"
                    value="Sign Me Up!"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="msg-alert">
        {status === 'sending' && <WarningBox message={'Sending...'} type={WarningType.WAIT} />}
        {status === 'success' && (
          <WarningBox
            message={
              'Thank you for signing up! We will send out email once GeoDa.AI is ready for preview.'
            }
            type={WarningType.SUCCESS}
          />
        )}
        {status === 'duplicate' && (
          <WarningBox
            message={'This email address has already been subscribed.'}
            type={WarningType.WARNING}
          />
        )}
        {status === 'error' && (
          <WarningBox
            message={'An unexpected internal error has occurred.'}
            type={WarningType.ERROR}
          />
        )}
      </div>
    </div>
  );
}

export function SignUpButton() {
  const [showSignUpForm, setShowSignUpForm] = useState(false);

  const onSignUpClick = () => {
    setShowSignUpForm(true);
  };

  const modalRef = useRef(null);

  const onCloseSignUpForm = () => {
    setShowSignUpForm(false);
  };

  return (
    <div className="user-buttons">
      <div className={'large-primary-wrapper geoda-ai-signup'}>
        <div className={`button large-primary-instance`} onClick={onSignUpClick}>
          Sign Up for Beta Preview
        </div>
      </div>
      {showSignUpForm ? (
        <Modal open={showSignUpForm} onClose={onCloseSignUpForm} center initialFocusRef={modalRef}>
          <SignUpModal />
        </Modal>
      ) : null}
    </div>
  );
}
