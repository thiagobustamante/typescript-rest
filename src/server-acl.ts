import * as Acl from 'acl';
import * as express from 'express';

const acl = new Acl(new Acl.memoryBackend());

interface Request extends express.Request {
    user: any;
}

export const invokeRolesPolicies = function (roles: string[], resources: string, permissions: string) {
    acl.allow([{
        roles: roles,
        // tslint:disable-next-line:object-literal-sort-keys
        allows: [{
            resources: resources,
            // tslint:disable-next-line:object-literal-sort-keys
            permissions: permissions
        }]
    }]);
};

/**
 * Check If Admin Policy Allows
 */
export const isAllowed = function (req: Request, res: express.Response, next: express.NextFunction) {
    const roles = (req.user) ? req.user.roles : ['guest'];
    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, allow) {
      if (err) {
        // An authorization error occurred
        return res.status(500).send('Unexpected authorization error');
      } else {
        if (allow) {
          // Access granted! Invoke next middleware
          return next();
        } else {
          return res.status(403).json({
            message: 'User is not authorized'
          });
        }
      }
    });
  };
