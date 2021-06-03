import './footer.scss';

import React from 'react';
import { Translate } from 'react-jhipster';
import { Col, Row } from 'reactstrap';

const Footer = props => (
  <div className="footer page-content">
    <Row>
      <Col md="12">
        <p>
          2014 - 2021 © International Compliance Workshop.
        </p>
      </Col>
    </Row>
  </div>
);

export default Footer;
