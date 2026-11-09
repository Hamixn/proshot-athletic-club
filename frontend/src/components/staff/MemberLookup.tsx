import React, { useState } from 'react';
import { api } from '../../lib/api';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Member } from '../../types/member';

interface MemberLookupProps {
  branchId: number;
  onSelectMember: (memberId: number) => Promise<void>;
  loading: boolean;
}

export const MemberLookup: React.FC<MemberLookupProps> = ({
  branchId,
  onSelectMember,
  loading,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchedOnce, setSearchedOnce] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearchedOnce(true);
    try {
      const res = await api.post('/checkin/search', {
        query: query.trim(),
        branch_id: branchId,
      });
      setResults(res.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 space-y-6">
      <div className="border-b border-[#EDE8DF]/10 pb-4">
        <span className="eyebrow-latin text-[#C9A96A] block mb-1">
          MEMBER DIRECTORY
        </span>
        <h3 className="text-lg sm:text-xl font-black text-[#EDE8DF]">
          جستجو در فهرست اعضا و ثبت ورود دستی
        </h3>
      </div>

      <form onSubmit={handleSearch} className="flex items-end gap-4">
        <div className="flex-1">
          <Input
            label="نام، شماره موبایل یا کد عضویت"
            placeholder="مثال: محمدی یا 09121111111"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          loading={searching}
          className="shrink-0"
        >
          جستجو
        </Button>
      </form>

      {results.length > 0 ? (
        <div className="divide-y divide-[#EDE8DF]/10 border-t border-b border-[#EDE8DF]/10">
          {results.map((m, idx) => (
            <div
              key={m.id}
              className="py-4 px-2 flex items-center justify-between gap-4 hover:bg-[#EDE8DF]/[0.02] transition-colors"
            >
              <div className="flex items-baseline gap-4 min-w-0">
                <span className="font-editorial italic text-base text-[#C9A96A]" dir="ltr">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <span className="font-bold text-[#EDE8DF] text-sm block truncate">
                    {m.full_name}
                  </span>
                  <span className="text-xs text-[#8A857B] font-mono block mt-0.5" dir="ltr">
                    {m.mobile}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectMember(m.id)}
                loading={loading}
              >
                ثبت ورود
              </Button>
            </div>
          ))}
        </div>
      ) : searchedOnce && !searching ? (
        <p className="text-xs text-[#8A857B] py-4 text-center">
          عضوی با این مشخصات یافت نشد.
        </p>
      ) : null}
    </Card>
  );
};
