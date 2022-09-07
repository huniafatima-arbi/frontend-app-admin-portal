import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { configuration } from '../../config';

import Img from '../Img';
import './Footer.scss';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enterpriseLogoNotFound: false,
    };
  }

  componentDidUpdate(prevProps) {
    const enterpriseLogo = this.props.enterpriseBranding?.logo;
    if (enterpriseLogo && enterpriseLogo !== prevProps.enterpriseBranding?.logo) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        enterpriseLogoNotFound: false,
      });
    }
  }

  renderEnterpriseLogo() {
    const { enterpriseBranding, enterpriseSlug, enterpriseName } = this.props;
    const enterpriseLogo = enterpriseBranding?.logo;
    return (
      <Link className="logo pl-4" to={`/${enterpriseSlug}`}>
        <Img
          src={enterpriseLogo}
          alt={`${enterpriseName} logo`}
          onError={() => this.setState({ enterpriseLogoNotFound: true })}
        />
      </Link>
    );
  }

  render() {
    const { enterpriseLogoNotFound } = this.state;
    const enterpriseLogo = this.props.enterpriseBranding?.logo;
    return (
      <footer className="container-fluid py-4 border-top">
        <div className="row justify-content-between align-items-center">
          <div className="col-xs-12 col-md-4 logo-links">
            <Link className="logo border-right pr-4" to="/">
              <Img src={configuration.LOGO_TRADEMARK_URL} alt="edX logo" />
            </Link>
            {enterpriseLogo && !enterpriseLogoNotFound && this.renderEnterpriseLogo()}
          </div>
          <div className="col-xs-12 col-md footer-links">
            <nav>
              <ul className="nav justify-content-end small">
                <li className="nav-item border-right">
                  <a className="nav-link px-2" href="https://www.edx.org/edx-terms-service">
                    Terms of Service
                  </a>
                </li>
                <li className="nav-item border-right">
                  <a className="nav-link px-2" href="https://www.edx.org/edx-privacy-policy">
                    Privacy Policy
                  </a>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link px-2"
                    to={{ pathname: configuration.ENTERPRISE_SUPPORT_URL }}
                    target="_blank"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    );
  }
}

Footer.propTypes = {
  enterpriseName: PropTypes.string,
  enterpriseSlug: PropTypes.string,
  enterpriseBranding: PropTypes.shape({
    logo: PropTypes.string,
  }),
};

Footer.defaultProps = {
  enterpriseName: null,
  enterpriseSlug: null,
  enterpriseBranding: null,
};

export default Footer;
