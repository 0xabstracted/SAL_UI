import React, { useContext, useState } from 'react'
import { StakePoolMetadata } from './ui_mapping'

export interface StakePoolMetadataValues {
  stakePoolMetadata: StakePoolMetadata | null
  setStakePoolMetadata: (stakePoolMetadata: StakePoolMetadata | null) => void
}

const EnvironmentContext: React.Context<null | StakePoolMetadataValues> =
  React.createContext<null | StakePoolMetadataValues>(null)

export function StakePoolMetadataProvider({
  children,
  poolMapping,
}: {
  children: React.ReactChild
  poolMapping: StakePoolMetadata | undefined
}) {
  const [stakePoolMetadata, setStakePoolMetadata] =
    useState<StakePoolMetadata | null>(poolMapping || null)

  return (
    <EnvironmentContext.Provider
      value={{
        stakePoolMetadata,
        setStakePoolMetadata: (x) => {
          setStakePoolMetadata(x)
        },
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  )
}

export function useStakePoolMetadataCtx(): StakePoolMetadataValues {
  const context = useContext(EnvironmentContext)
  if (!context) {
    throw new Error('Missing stakePoolMetadata context')
  }
  return context
}
