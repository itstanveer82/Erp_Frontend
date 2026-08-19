# Attendance & Payroll ERP - Frontend Structure

## Current structure

- `auth/` - login, forgot-password, reset-password
- `employee-management/` - employee list and add-employee pages
- `dashboard.html` - current shared dashboard (kept shared until backend role permissions are finalized)
- `admin/` - reserved for Admin-specific pages
- `hr/` - reserved for HR-specific pages
- `employee/` - reserved for Employee self-service pages
- `components/` - shared UI components
- `assets/` - Bootstrap assets
- `css/` - shared/page CSS
- `js/` - shared/page JavaScript
- `images/` - images

## Important
The Employee List is not placed under `admin/` because the current requirement says both Admin and HR may have employee-management access. Final role-specific routing should be decided after backend permission confirmation.

No backend API behavior was changed in this restructuring.
