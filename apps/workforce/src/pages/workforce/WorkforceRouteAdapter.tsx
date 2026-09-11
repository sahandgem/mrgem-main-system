import { WorkforceRoutePageByPath } from "../../WorkforcePages";

export function createWorkforcePage(path: string) {
  function WorkforcePageEntry() {
    return <WorkforceRoutePageByPath path={path} />;
  }

  return WorkforcePageEntry;
}
