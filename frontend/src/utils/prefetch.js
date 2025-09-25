// Utility functions for prefetching data to improve initial load performance

import api from "../services/api";
import { getCachedDashboardData, setCachedDashboardData } from "./auth";

/**
 * Prefetch dashboard data for the current user role
 * This function should be called after login to cache data for faster initial loads
 */
export const prefetchDashboardData = async (role) => {
  try {
    console.log(`[Prefetch] Starting prefetch for ${role} dashboard`);
    
    // Check if we already have cached data
    const cachedData = getCachedDashboardData();
    if (cachedData) {
      console.log("[Prefetch] Using existing cached dashboard data");
      return cachedData;
    }
    
    let dashboardData;
    
    switch (role) {
      case 'recruiter':
        // Fetch recruiter dashboard data
        const [overviewRes, statsRes, jobsRes, applicationsRes] = await Promise.allSettled([
          api.get("/dashboard/recruiter/overview"),
          api.get("/jobs/recruiter/stats"),
          api.get("/jobs/recruiter/my-jobs?limit=5"),
          api.get("/applications/recruiter/stats")
        ]);
        
        dashboardData = {
          overview: overviewRes.status === 'fulfilled' ? overviewRes.value.data.data : null,
          jobs: statsRes.status === 'fulfilled' ? statsRes.value.data.data : null,
          recentJobs: jobsRes.status === 'fulfilled' ? jobsRes.value.data.data.jobs : [],
          applications: applicationsRes.status === 'fulfilled' ? applicationsRes.value.data.data : null
        };
        break;
        
      case 'student':
        // Fetch student dashboard data
        const [studentOverviewRes, studentStatsRes, studentApplicationsRes] = await Promise.allSettled([
          api.get("/dashboard/student/overview"),
          api.get("/jobs/student/stats"),
          api.get("/applications/student/stats")
        ]);
        
        dashboardData = {
          overview: studentOverviewRes.status === 'fulfilled' ? studentOverviewRes.value.data.data : null,
          jobs: studentStatsRes.status === 'fulfilled' ? studentStatsRes.value.data.data : null,
          applications: studentApplicationsRes.status === 'fulfilled' ? studentApplicationsRes.value.data.data : null
        };
        break;
        
      case 'admin':
        // Fetch admin dashboard data
        const [adminOverviewRes, adminStatsRes] = await Promise.allSettled([
          api.get("/dashboard/admin/overview"),
          api.get("/admin/stats")
        ]);
        
        dashboardData = {
          overview: adminOverviewRes.status === 'fulfilled' ? adminOverviewRes.value.data.data : null,
          stats: adminStatsRes.status === 'fulfilled' ? adminStatsRes.value.data.data : null
        };
        break;
        
      default:
        console.warn(`[Prefetch] No prefetch strategy for role: ${role}`);
        return null;
    }
    
    // Cache the fetched data
    setCachedDashboardData(dashboardData);
    console.log(`[Prefetch] Successfully prefetched and cached data for ${role}`);
    
    return dashboardData;
  } catch (error) {
    console.error(`[Prefetch] Error prefetching dashboard data for ${role}:`, error);
    return null;
  }
};

/**
 * Prefetch commonly used assets like images, fonts, etc.
 */
export const prefetchAssets = () => {
  // Add any critical assets that should be prefetched
  console.log("[Prefetch] Prefetching critical assets");
  
  // Example: prefetch commonly used icons
  // const iconUrls = [
  //   '/icons/dashboard-icon.svg',
  //   '/icons/profile-icon.svg',
  //   // ... other icons
  // ];
  // 
  // iconUrls.forEach(url => {
  //   const link = document.createElement('link');
  //   link.rel = 'prefetch';
  //   link.href = url;
  //   document.head.appendChild(link);
  // });
};

/**
 * Initialize prefetching when the app starts
 */
export const initializePrefetching = (role) => {
  // Prefetch assets immediately
  prefetchAssets();
  
  // Prefetch dashboard data in the background if we have a role
  if (role) {
    // Use a small delay to avoid blocking initial render
    setTimeout(() => {
      prefetchDashboardData(role);
    }, 1000);
  }
};

export default {
  prefetchDashboardData,
  prefetchAssets,
  initializePrefetching
};