import api from './api';

export interface ReportData {
  salesVsTarget: { name: string; actual: number; target: number }[];
  regionalDistribution: { name: string; value: number; percentage: number }[];
  productPerformance: { product: string; revenue: number; unitsSold: number; avgPrice: number }[];
  adsAnalytics: { name: string; value: number }[];
  visitAnalytics: { name: string; visits: number; allowance: number }[];
  callAnalytics: { name: string; count: number; duration: number }[];
}

export const reportsService = {
  getParams: (filters: { dateRange?: string; region?: string; productId?: string }) => {
    const params = new URLSearchParams();
    if (filters.dateRange) {
      const rangeMap: Record<string, string> = {
        'last-7-days': 'Last 7 Days',
        'last-30-days': 'Last 30 Days',
        'last-90-days': 'Last 90 Days',
        'this-year': 'This Year',
      };
      params.append('dateRange', rangeMap[filters.dateRange] || 'Last 30 Days');
    }
    
    if (filters.region && filters.region !== 'all') {
      const regionVal = filters.region.charAt(0).toUpperCase() + filters.region.slice(1);
      params.append('region', regionVal);
    }
    
    if (filters.productId && filters.productId !== 'all') {
      params.append('productId', filters.productId);
    }
    return params;
  },

  getReportData: async (filters: { dateRange?: string; region?: string; productId?: string }) => {
    const params = reportsService.getParams(filters);
    const response = await api.get<ReportData>(`/reports/data?${params.toString()}`);
    return response.data;
  },
};
