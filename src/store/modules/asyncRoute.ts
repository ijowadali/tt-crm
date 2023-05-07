import { toRaw, unref } from 'vue';
import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router';
import { store } from '@/store';
import { asyncRoutes, constantRouter } from '@/router/index';
import { generateDynamicRoutes } from '@/router/generator';
import { useProjectSetting } from '@/hooks/setting/useProjectSetting';

interface TreeHelperConfig {
  id: string;
  children: string;
  pid: string;
}

const DEFAULT_CONFIG: TreeHelperConfig = {
  id: 'id',
  children: 'children',
  pid: 'pid',
};

const getConfig = (config: Partial<TreeHelperConfig>) => Object.assign({}, DEFAULT_CONFIG, config);

export interface IAsyncRouteState {
  menus: RouteRecordRaw[];
  routers: any[];
  routersAdded: any[];
  keepAliveComponents: string[];
  isDynamicRouteAdded: boolean;
}

function filter<T = any>(
  tree: T[],
  func: (n: T) => boolean,
  config: Partial<TreeHelperConfig> = {}
): T[] {
  config = getConfig(config);
  const children = config.children as string;

  function listFilter(list: T[]) {
    return list
      .map((node: any) => ({ ...node }))
      .filter((node) => {
        node[children] = node[children] && listFilter(node[children]);
        return func(node) || (node[children] && node[children].length);
      });
  }

  return listFilter(tree);
}

export const useAsyncRouteStore = defineStore({
  id: 'app-async-route',
  state: (): IAsyncRouteState => ({
    menus: [],
    routers: constantRouter,
    routersAdded: [],
    keepAliveComponents: [],
    // Whether the route has been dynamically added
    isDynamicRouteAdded: false,
  }),
  getters: {
    getMenus(): RouteRecordRaw[] {
      return this.menus;
    },
    getIsDynamicRouteAdded(): boolean {
      return this.isDynamicRouteAdded;
    },
  },
  actions: {
    getRouters() {
      return toRaw(this.routersAdded);
    },
    setDynamicRouteAdded(added: boolean) {
      this.isDynamicRouteAdded = added;
    },
    // Set dynamic routing
    setRouters(routers: RouteRecordRaw[]) {
      this.routersAdded = routers;
      this.routers = constantRouter.concat(routers);
    },
    setMenus(menus: RouteRecordRaw[]) {
      // Set dynamic routing
      this.menus = menus;
    },
    setKeepAliveComponents(compNames: string[]) {
      // Set the components that need to be cached
      this.keepAliveComponents = compNames;
    },
    async generateRoutes(storeData: any) {
      let accessedRouters: any;
      const permissionsList = storeData.permissions;
      const routeFilter = (route: any) => {
        const { meta } = route;
        const { permissions } = meta || {};
        if (!permissions) return true;
        if (storeData.info.user_type === 'super admin') {
          return true;
        } else {
          return permissionsList.some((item: any) => permissions.includes(item));
        }
      };
      const { permissionMode } = useProjectSetting();
      if (unref(permissionMode) === 'BACK') {
        // Get the menu dynamically
        try {
          accessedRouters = await generateDynamicRoutes();
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          //Filter whether the account has a certain permission, and remove the menu from the loading list
          accessedRouters = filter(asyncRoutes, routeFilter);
        } catch (error) {
          console.log(error);
        }
      }
      accessedRouters = accessedRouters.filter(routeFilter);
      this.setRouters(accessedRouters);
      this.setMenus(accessedRouters);
      return toRaw(accessedRouters);
    },
  },
});

// Need to be used outside the setup
export function useAsyncRoute() {
  return useAsyncRouteStore(store);
}
