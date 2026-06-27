import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

// react-router-dom v6 removed withRouter. This shim preserves the v5
// props shape (history.push/goBack, location, match.params) so existing
// class components that rely on it don't need their internals rewritten.
export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const history = {
      push: (path) => navigate(path),
      replace: (path) => navigate(path, { replace: true }),
      goBack: () => navigate(-1),
    };

    return (
      <Component
        {...props}
        history={history}
        location={location}
        match={{ params }}
      />
    );
  }

  return ComponentWithRouterProp;
}
