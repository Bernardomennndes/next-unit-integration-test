/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';

type Scope<C = any> = { [scopeName: string]: React.Context<C>[] } | undefined;
type ScopeHook = (scope: Scope) => { [_scopeProp: string]: Scope };
interface CreateScope {
  scopeName: string;
  (): ScopeHook;
}

function createContext<ContextValueType extends null | object>(
  rootComponentName: string,
  defaultContext?: ContextValueType,
) {
  const Context = React.createContext<ContextValueType | undefined>(
    defaultContext,
  );

  function Provider(props: ContextValueType & { children: React.ReactNode }) {
    const { children, ...context } = props;
    const value = React.useMemo(
      () => context,
      Object.values(context),
    ) as ContextValueType;
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContext(consumerName: string) {
    const context = React.useContext(Context);
    if (context) return context;
    if (defaultContext !== undefined) return defaultContext;

    throw new Error(
      `\`${consumerName}\` must be used within \`${rootComponentName}\``,
    );
  }

  Provider.displayName = rootComponentName + 'Provider';
  return [Provider, useContext] as const;
}

/**
 * Create a scoped function that
 */
function createContextScope(
  scopeName: string,
  createContextScopeDeps: CreateScope[] = [],
) {
  let defaultContexts: any[] = [];

  function createContext<ContextValueType extends null | object>(
    rootComponentName: string,
    defaultContext?: ContextValueType,
  ) {
    const BaseContext = React.createContext<ContextValueType | undefined>(
      defaultContext,
    );
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];

    function Provider(
      props: ContextValueType & {
        children: React.ReactNode;
        scope: Scope<ContextValueType>;
      },
    ) {
      const { children, scope, ...context } = props;
      const Context = scope?.[scopeName][index] ?? BaseContext;
      const value = React.useMemo(
        () => context,
        Object.values(context),
      ) as ContextValueType;
      return <Context.Provider value={value}>{children}</Context.Provider>;
    }

    function useContext(
      consumerName: string,
      scope: Scope<ContextValueType | undefined>,
    ) {
      const Context = scope?.[scopeName][index] ?? BaseContext;
      const context = React.useContext(Context);
      if (context) return context;
      if (defaultContext !== undefined) return defaultContext;

      throw new Error(
        `\`${consumerName}\` must be used within \`${rootComponentName}\``,
      );
    }

    Provider.displayName = rootComponentName + 'Provider';
    return [Provider, useContext] as const;
  }

  const createScope: CreateScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) =>
      React.createContext(defaultContext),
    );
    return function useScope(scope: Scope) {
      const contexts = scope?.[scopeName] ?? scopeContexts;

      return React.useMemo(
        () => ({
          [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts },
        }),
        [scope, contexts],
      );
    };
  };

  createScope.scopeName = scopeName;
  return [
    createContext,
    composeContextScopes(createScope, ...createContextScopeDeps),
  ] as const;
}

function composeContextScopes(...scopes: CreateScope[]) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;

  const createScope: CreateScope = () => {
    const scopeHooks = scopes.map((createScope) => ({
      scopeName: createScope.scopeName,
      useScope: createScope(),
    }));

    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce(
        (nextScopes, { scopeName, useScope }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const scopeProps = useScope(overrideScopes);
          const currentScope = scopeProps[`__scope${scopeName}`];
          return { ...nextScopes, ...currentScope };
        },
        {},
      );

      return React.useMemo(
        () => ({ [`__scope${baseScope.scopeName}`]: nextScopes }),
        [nextScopes],
      );
    };
  };

  createScope.scopeName = baseScope.scopeName;
  return createScope;
}

export { createContext, createContextScope };
export type { CreateScope, Scope };
