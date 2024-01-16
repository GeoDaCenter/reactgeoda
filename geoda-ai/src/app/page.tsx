/* eslint-disable @next/next/no-img-element */
import '@/styles/globals.css';
import '@/styles/styleguide.css';
import '@/styles/landing.css';

export default function Page() {
  return (
    <div className="landing-page-wrapper">
      <div className="body-frame-wrapper">
        <div className="body-frame">
          <div className="header-wrapper">
            <div className="headline-frame">
              <div className="headline-content">
                <div className="geoda-ai-logo-frame">
                  <div className="geoda-ai">GeoDa.AI</div>
                  <img className="geoda-ai-logo" alt="Geoda ai logo" src="img/geoda-ai-logo.png" />
                </div>
                <div className="geoda-ai-x">
                  <p className="geoda-ai-text">
                    <span className="text-wrapper">Free, Open-Sourced and </span>
                    <span className="span">AI </span>
                    <span className="text-wrapper">Powered Spatial Data Analysis</span>
                  </p>
                </div>
                <div className="user-buttons">
                  <div className={'large-primary-wrapper geoda-ai-signup'}>
                    <div className={`button large-primary-instance`}>Sign Up for Beta Preview</div>
                  </div>
                </div>
              </div>
              <div className={`headline-image headline-image-laptop`}>
                <div className="overlap-group">
                  <div className="tela">
                    <div className="conte-do-da-tela" />
                  </div>
                  <img className="base" alt="Base" src="img/base-1.png" />
                  <img
                    className="geoda-ai-main"
                    alt="Geoda ai main"
                    src="img/geoda-ai-main-screenshot-1.png"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="content-wrapper">
            <div className="intro">
              <div className="intro-img">
                <img className="img-intro" alt="Img intro" src="img/img-intro-1.png" />
              </div>
              <div className="intro-content">
                <p className="intro-title">Ask Anything About Spatial Data Analysis</p>
                <div className="flexcontainer">
                  <p className="text">
                    <span className="text-wrapper-2">
                      GeoDa AI is a customized language model with deep learning capabilities that
                      can assist users with spatial analysis tasks by responding to their text
                      prompts. The model is trained on a corpus of spatial data and spatial analysis
                      tasks, and it can understand and respond to a variety of natural language
                      queries.
                      <br />
                    </span>
                  </p>
                  <p className="text">
                    <span className="text-wrapper-2">
                      <br />
                    </span>
                  </p>
                  <p className="text">
                    <span className="text-wrapper-2">
                      You can ask anything about your data and apply spatial data analysis using
                      GeoDa.AI. GeoDa AI can run statistics, generate maps and charts to visualize
                      spatial data.
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="intro">
              <div className="image-wrapper">
                <img className="image" alt="Image" src="img/image-1.png" />
              </div>
              <div className="intro-content">
                <p className="intro-title">Get Insights With Powerful Tools</p>
                <div className="flexcontainer">
                  <p className="text">
                    <span className="text-wrapper-2">
                      GeoDa AI is a customized language model with deep learning capabilities that
                      can assist users with spatial analysis tasks by responding to their text
                      prompts. The model is trained on a corpus of spatial data and spatial analysis
                      tasks, and it can understand and respond to a variety of natural language
                      queries.
                      <br />
                    </span>
                  </p>
                  <p className="text">
                    <span className="text-wrapper-2">
                      <br />
                    </span>
                  </p>
                  <p className="text">
                    <span className="text-wrapper-2">
                      You can ask anything about your data and apply spatial data analysis using
                      GeoDa.AI. GeoDa AI can run statistics, generate maps and charts to visualize
                      spatial data.
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="intro">
              <div className="interactive-map-wrapper">
                <img
                  className="interactive-map"
                  alt="Interactive map"
                  src="img/interactive-map-1.gif"
                />
              </div>
              <div className="intro-content">
                <div className="intro-title">Interactive Spatial Data Analysis</div>
                <div className="flexcontainer">
                  <p className="text">
                    <span className="text-wrapper-2">
                      GeoDa AI is a customized language model with deep learning capabilities that
                      can assist users with spatial analysis tasks by responding to their text
                      prompts. The model is trained on a corpus of spatial data and spatial analysis
                      tasks, and it can understand and respond to a variety of natural language
                      queries.
                      <br />
                    </span>
                  </p>
                  <p className="text">
                    <span className="text-wrapper-2">
                      <br />
                    </span>
                  </p>
                  <p className="text">
                    <span className="text-wrapper-2">
                      You can ask anything about your data and apply spatial data analysis using
                      GeoDa.AI. GeoDa AI can run statistics, generate maps and charts to visualize
                      spatial data.
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="intro">
              <div className="screenshot-wrapper">
                <img className="screenshot" alt="Screenshot" src="img/image-4.png" />
              </div>
              <div className="intro-content">
                <p className="intro-title">Share Your Analysis Dashboard With Style</p>
                <div className="flexcontainer">
                  <p className="text">
                    <span className="text-wrapper-2">
                      GeoDa AI is a customized language model with deep learning capabilities that
                      can assist users with spatial analysis tasks by responding to their text
                      prompts. The model is trained on a corpus of spatial data and spatial analysis
                      tasks, and it can understand and respond to a variety of natural language
                      queries.
                      <br />
                    </span>
                  </p>
                  <p className="text">
                    <span className="text-wrapper-2">
                      <br />
                    </span>
                  </p>
                  <p className="text">
                    <span className="text-wrapper-2">
                      You can ask anything about your data and apply spatial data analysis using
                      GeoDa.AI. GeoDa AI can run statistics, generate maps and charts to visualize
                      spatial data.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-wrapper">
            <img className="img-csds" alt="Img csds" src="img/img-csds.png" />
            <img className="img-uchicago" alt="Img uchicago" src="img/img-uchicago.png" />
            <img className="img-openjs" alt="Img openjs" src="img/img-openjs.png" />
            <img className="img-visgl" alt="Img visgl" src="img/img-visgl.png" />
          </div>
        </div>
      </div>
    </div>
  );
}
