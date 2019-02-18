// @flow
import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import CircularProgress from 'material-ui/CircularProgress'

import {
  replayIconColor,
  retryButtonStyle
} from './upload-preloader.mui-styles'

type Props = {
  process: any,
  handleRetryUpload: any => void
}

export default class UploadPreloader extends React.Component<Props> {
  render () {
    const { process, handleRetryUpload } = this.props
    return (
      <div className='absolute z-999 w-100 h-100 flex flex-column items-center justify-center'>
        <div className='dib h40px w40px bg-black-20 br-100'>
          {process.error ? (
            <IconButton style={retryButtonStyle} onClick={evt => {
              evt.preventDefault()
              handleRetryUpload(process)
            }}>
              <FontIcon className='material-icons' color={replayIconColor}>refresh</FontIcon>
            </IconButton>
          ) : process.percent ? (
            <CircularProgress
              size={40} thickness={5} mode='determinate' value={process.percent} />
          ) : (
            <div className='dib'>
              <CircularProgress
                size={40} thickness={5} mode='indeterminate' />
            </div>
          )}
        </div>
        {!!process.errorMessage && (
          <div className='bg-black-30 br-pill f7 white dib ph2'>
            {process.errorMessage}
          </div>
        )}
      </div>
    )
  }
}
