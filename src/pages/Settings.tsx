import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { BRANCHES, type Branch, type Role } from '../types';
import {
  STAFF_DEFAULT_BRANCH_STORAGE_KEY,
  getStaffDefaultBranch,
} from '../utils/roleAccess';

const ENABLED_BRANCHES_STORAGE_KEY = 'kpo-enabled-branches';
const SETTINGS_PREFERENCES_STORAGE_KEY = 'kpo-settings-preferences';

interface SettingsProps {
  role: Role;
}

interface SettingsPreferences {
  receiptAutoPrint: boolean;
  receiptIncludeLogo: boolean;
  notificationsEmail: boolean;
  notificationsOverdueAlerts: boolean;
}

const defaultPreferences: SettingsPreferences = {
  receiptAutoPrint: false,
  receiptIncludeLogo: true,
  notificationsEmail: true,
  notificationsOverdueAlerts: true,
};

const parseEnabledBranches = (value: string | null): Branch[] => {
  if (!value) {
    return [...BRANCHES];
  }

  try {
    const parsed = JSON.parse(value) as string[];
    const filtered = BRANCHES.filter((branch) => parsed.includes(branch));
    return filtered.length ? filtered : [...BRANCHES];
  } catch {
    return [...BRANCHES];
  }
};

const parsePreferences = (value: string | null): SettingsPreferences => {
  if (!value) {
    return defaultPreferences;
  }

  try {
    const parsed = JSON.parse(value) as Partial<SettingsPreferences>;
    return {
      receiptAutoPrint: Boolean(parsed.receiptAutoPrint),
      receiptIncludeLogo: parsed.receiptIncludeLogo !== false,
      notificationsEmail: parsed.notificationsEmail !== false,
      notificationsOverdueAlerts: parsed.notificationsOverdueAlerts !== false,
    };
  } catch {
    return defaultPreferences;
  }
};

const Settings = ({ role }: SettingsProps) => {
  const [enabledBranches, setEnabledBranches] = useState<Branch[]>([...BRANCHES]);
  const [staffDefaultBranch, setStaffDefaultBranch] = useState<Branch>(getStaffDefaultBranch());
  const [preferences, setPreferences] = useState<SettingsPreferences>(defaultPreferences);

  useEffect(() => {
    setEnabledBranches(parseEnabledBranches(window.localStorage.getItem(ENABLED_BRANCHES_STORAGE_KEY)));
    setStaffDefaultBranch(getStaffDefaultBranch());
    setPreferences(parsePreferences(window.localStorage.getItem(SETTINGS_PREFERENCES_STORAGE_KEY)));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ENABLED_BRANCHES_STORAGE_KEY, JSON.stringify(enabledBranches));
  }, [enabledBranches]);

  useEffect(() => {
    window.localStorage.setItem(STAFF_DEFAULT_BRANCH_STORAGE_KEY, staffDefaultBranch);
  }, [staffDefaultBranch]);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const toggleBranch = (branch: Branch) => {
    setEnabledBranches((current) => {
      const exists = current.includes(branch);
      if (exists) {
        const updated = current.filter((item) => item !== branch);
        return updated.length ? updated : current;
      }

      return [...current, branch];
    });
  };

  const updatePreference = <K extends keyof SettingsPreferences>(key: K, value: SettingsPreferences[K]) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <Card title="Role & Access">
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold text-slate-700">Current Role:</span> {role}
          </p>
          <p className="text-slate-500">
            Role is controlled by the top-right role switcher and simulated locally.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Branch Management">
          <p className="mb-3 text-sm text-slate-500">Select active branches for this dashboard environment.</p>
          <div className="space-y-2">
            {BRANCHES.map((branch) => (
              <label key={branch} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-500"
                  checked={enabledBranches.includes(branch)}
                  onChange={() => toggleBranch(branch)}
                />
                {branch}
              </label>
            ))}
          </div>
        </Card>

        <Card title="Default Branch (Staff Mode)">
          <p className="mb-3 text-sm text-slate-500">
            Choose which branch Staff role should be scoped to by default.
          </p>
          <select
            className="input-base min-w-0 w-full"
            value={staffDefaultBranch}
            onChange={(event) => setStaffDefaultBranch(event.target.value as Branch)}
          >
            {BRANCHES.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Company Profile">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold text-slate-700">Company Name:</span> Kpoikpoimingi Investment Limited
            </p>
            <p>
              <span className="font-semibold text-slate-700">Business Type:</span> Hire Purchase Asset Financing
            </p>
            <p>
              <span className="font-semibold text-slate-700">Head Office:</span> Abuja HQ
            </p>
          </div>
        </Card>

        <Card title="Receipt Preferences">
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-500"
                checked={preferences.receiptIncludeLogo}
                onChange={(event) => updatePreference('receiptIncludeLogo', event.target.checked)}
              />
              Include company logo on receipts
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-500"
                checked={preferences.receiptAutoPrint}
                onChange={(event) => updatePreference('receiptAutoPrint', event.target.checked)}
              />
              Auto-open print dialog after receipt generation
            </label>
          </div>
        </Card>
      </div>

      <Card title="Notification Preferences">
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-500"
              checked={preferences.notificationsEmail}
              onChange={(event) => updatePreference('notificationsEmail', event.target.checked)}
            />
            Enable payment confirmation emails
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-500"
              checked={preferences.notificationsOverdueAlerts}
              onChange={(event) => updatePreference('notificationsOverdueAlerts', event.target.checked)}
            />
            Enable overdue payment alert banners
          </label>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
