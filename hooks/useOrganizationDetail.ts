import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { supabase } from '../utils/supabase';

export interface OrganizationDetail {
  orgId: string;
  orgName: string;
  label: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  websiteUrl: string;
  instagramUrl: string;
  streetAddress: string;
  cityName: string;
  provinceName: string;
  postalCode: string;
  status: string;
  orgEmail: string;
  orgEmailVerified: boolean;
}

export function useOrganizationDetail(id?: string) {
  const [organization, setOrganization] = useState<OrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    if (!id) {
      setError('Organization id is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .eq('orgId', id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Organization not found');

      setOrganization({
        orgId: String(data.orgId ?? id),
        orgName: data.orgName || data.org_name || data.name || 'Organization',
        label: data.label || '',
        description: data.description || 'No description available yet.',
        logoUrl: data.logoUrl || data.logo_url || '',
        bannerUrl: data.bannerUrl || data.banner_url || '',
        websiteUrl: data.websiteUrl || data.website_url || '',
        instagramUrl: data.instagramUrl || data.instagram_url || '',
        streetAddress: data.street_address || data.streetAddress || '',
        cityName: data.city_name || data.cityName || data.city || '',
        provinceName: data.province_name || data.provinceName || '',
        postalCode: data.postal_code || data.postalCode || '',
        status: data.status || '',
        orgEmail: data.orgEmail || data.org_email || '',
        orgEmailVerified: Boolean(data.orgEmailVerified ?? data.org_email_verified ?? false),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load organization');
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const initials = useMemo(
    () =>
      organization?.orgName
        ?.split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() || '')
        .join('') || 'OR',
    [organization?.orgName]
  );

  const locationLine = useMemo(
    () => [organization?.cityName, organization?.provinceName].filter(Boolean).join(', '),
    [organization?.cityName, organization?.provinceName]
  );

  const openExternalUrl = useCallback(async (rawUrl: string) => {
    if (!rawUrl) return;
    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const canOpen = await Linking.canOpenURL(normalizedUrl);
    if (canOpen) {
      await Linking.openURL(normalizedUrl);
    }
  }, []);

  return {
    organization,
    loading,
    error,
    fetchOrganization,
    initials,
    locationLine,
    openExternalUrl,
  };
}
