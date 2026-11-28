import React from 'react';
import { WorkspaceHourglassLoader } from '@/components/WorkspaceHourglassLoader';

export default function WorkspaceLoading() {
  return <WorkspaceHourglassLoader visible={true} label="SYNCING WORKSPACE" />;
}
