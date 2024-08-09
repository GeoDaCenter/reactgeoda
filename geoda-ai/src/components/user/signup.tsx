'use client';

import {useState, FormEvent} from 'react';
import {Icon} from '@iconify/react';
import jsonp from 'jsonp';
import Link from 'next/link';
import {Button, Card, CardBody, CardHeader, Spacer} from '@nextui-org/react';
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
    <Card>
      <CardHeader>
        <p className="text-sm">You can sign up for GeoDa.AI official release (optinal)</p>
      </CardHeader>
      <CardBody>
        <div id="signup-modal">
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
                <div id="mc_embed_signup_scroll" className="flex flex-row gap-2">
                  <>
                    <div className="mc-field-group flex flex-row items-start gap-2">
                      <label htmlFor="mce-EMAIL" className="hidden text-sm">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="EMAIL"
                        className="required email w-[350px] rounded-sm bg-slate-100 p-2 text-black"
                        placeholder="Enter your email"
                        id="mce-EMAIL"
                        value={email}
                        onChange={onInputChange}
                      />
                      <span id="mce-EMAIL-HELPERTEXT" className="helper_text"></span>
                    </div>
                    <div id="mce-responses" className="clear foot">
                      <div
                        className="response"
                        id="mce-error-response"
                        style={{display: 'none'}}
                      ></div>
                      <div
                        className="response"
                        id="mce-success-response"
                        style={{display: 'none'}}
                      ></div>
                    </div>
                    <div aria-hidden="true" style={{position: 'absolute', left: '-5000px'}}>
                      <input
                        type="text"
                        name="b_06b2700cae8218b88f097724d_6a6f176215"
                        value=""
                        readOnly
                      />
                    </div>
                  </>
                  <div className="optionalParent">
                    <div className="clear foot">
                      <input
                        type="submit"
                        name="subscribe"
                        id="mc-embedded-subscribe"
                        className="button h-[40px] w-[100px] rounded-md bg-slate-700 text-sm text-white"
                        value="Submit"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="msg-alert mt-3">
            {status === 'sending' && <WarningBox message={'Sending...'} type={WarningType.WAIT} />}
            {status === 'success' && (
              <WarningBox
                message={
                  'Thank you for signing up! We will send out email once GeoDa.AI is officially released.'
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
      </CardBody>
    </Card>
  );
}

export function SignUpButton() {
  return (
    <div className="flex flex-col gap-4 p-10">
      <p>
        This is the technical preview of GeoDa.AI. It is free to use and will be open-sourced.
        Please note that this preview is not intended for production use and may contain bugs or
        other issues. It is also subject to change without notice.
      </p>
      <p>
        If you have any feedback or suggestions, please let us know by creating an issue on our
        repository at &nbsp;
        <Link
          target="_blank"
          href="https://github.com/orgs/geodaai/discussions/categories/bugs"
          className="text-blue-500"
        >
          Github/geodaai
        </Link>
        . We appreciate your help in making GeoDa.AI better for everyone.
      </p>
      <Spacer y={2} />
      <Link href="/preview">
        <Button
          radius="lg"
          className="bg-gradient-to-tr from-pink-500 to-yellow-500 p-6 text-large text-white shadow-lg"
          endContent={<Icon icon="akar-icons:arrow-right" />}
        >
          Get Started
        </Button>
      </Link>
      <Spacer y={4} />
      <SignUpModal />
    </div>
  );
}
