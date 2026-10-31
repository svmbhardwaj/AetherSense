"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSystemStatus() {
  return useQuery({ queryKey: ["system-status"], queryFn: () => api.system.status(), refetchInterval: 10_000 });
}

export function useDataSources() {
  return useQuery({ queryKey: ["data-sources"], queryFn: () => api.system.dataSources() });
}

export function useActiveEvent() {
  return useQuery({ queryKey: ["active-event"], queryFn: () => api.events.active(), retry: false });
}

export function useEvents() {
  return useQuery({ queryKey: ["events"], queryFn: () => api.events.list() });
}

export function useEvent(id?: string) {
  return useQuery({ queryKey: ["event", id], queryFn: () => api.events.get(id as string), enabled: !!id });
}

export function useEventTrack(id?: string) {
  return useQuery({ queryKey: ["track", id], queryFn: () => api.events.track(id as string), enabled: !!id });
}

export function useRiskAreas(id?: string) {
  return useQuery({ queryKey: ["risk-areas", id], queryFn: () => api.events.riskAreas(id as string), enabled: !!id });
}

export function useFloodExtent(id?: string) {
  return useQuery({ queryKey: ["flood-extent", id], queryFn: () => api.events.floodExtent(id as string), enabled: !!id });
}

export function useEventTimeline(id?: string) {
  return useQuery({ queryKey: ["timeline", id], queryFn: () => api.events.timeline(id as string), enabled: !!id });
}

export function useEventResponse(id?: string) {
  return useQuery({ queryKey: ["response", id], queryFn: () => api.events.response(id as string), enabled: !!id, retry: false });
}

export function useMemoryInsights(id?: string) {
  return useQuery({ queryKey: ["memory-insights", id], queryFn: () => api.events.memoryInsights(id as string), enabled: !!id, retry: false });
}

export function useShelters(params?: { lat?: number; lon?: number; radiusM?: number }) {
  return useQuery({ queryKey: ["shelters", params], queryFn: () => api.shelters.list(params) });
}

export function useRoutes() {
  return useQuery({ queryKey: ["routes"], queryFn: () => api.routes.list() });
}

export function useAlertStats() {
  return useQuery({ queryKey: ["alert-stats"], queryFn: () => api.alerts.stats(), refetchInterval: 4000 });
}

export function useAlertCampaigns(eventId?: string) {
  return useQuery({ queryKey: ["alert-campaigns", eventId], queryFn: () => api.alerts.list(eventId) });
}

export function useAlertActivity() {
  return useQuery({ queryKey: ["alert-activity"], queryFn: () => api.alerts.activity(), refetchInterval: 8000 });
}

export function useAlertProviders() {
  return useQuery({ queryKey: ["alert-providers"], queryFn: () => api.alerts.providers() });
}
