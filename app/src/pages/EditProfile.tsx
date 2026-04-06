import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import OAButton from '../components/OAButton';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: API call to update profile
    await new Promise(r => setTimeout(r, 500));
    await refreshUser();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4">
              <ChevronLeft size={18} />
              <span className="type-headline-small">Back</span>
            </button>
            <h1 className="type-headline-large text-text-primary md:text-[24px]">Edit Profile</h1>
          </div>
        </div>

        <div className="container-content section-tight">
          <div className="max-w-[480px] flex flex-col gap-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-action-secondary flex items-center justify-center shrink-0">
                <span className="text-[24px] font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="type-headline-small text-text-primary">{user?.name}</p>
                <p className="type-description text-text-tertiary">{user?.email}</p>
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="type-description font-semibold text-text-primary">Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-[12px] border border-border-default bg-bg-base type-body-default text-text-primary outline-none focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20 transition-colors"
              />
            </div>

            {/* Email (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="type-description font-semibold text-text-primary">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full px-4 py-3 rounded-[12px] border border-border-default bg-bg-secondary type-body-default text-text-tertiary outline-none"
              />
              <span className="type-pre-text text-text-tertiary">Email cannot be changed</span>
            </div>

            {/* Save */}
            <OAButton
              variant="primary"
              size="medium"
              fullWidth
              state={saving ? 'disabled' : 'default'}
              onClick={handleSave}
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </OAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
