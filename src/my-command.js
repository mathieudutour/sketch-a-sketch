import BrowserWindow from 'sketch-module-web-view'
const sketch = require('sketch')

function getContentFrame(document) {
  const window = document.sketchObject.window()
  const view = document.sketchObject.contentDrawView()

  const frameRelativeToWindow = view.convertRect_toView(view.bounds(), null)
  const frameRelativeToScreen = window.convertRectToScreen(frameRelativeToWindow)

  const mainScreenRect = NSScreen.screens()
    .firstObject()
    .frame()

  return {
    x: frameRelativeToScreen.origin.x,
    y: mainScreenRect.size.height - frameRelativeToScreen.size.height - frameRelativeToScreen.origin.y,
    width: frameRelativeToScreen.size.width,
    height: frameRelativeToScreen.size.height
  }
}

function moveCursor({direction, value}) {
  const document = sketch.getSelectedDocument()

  let lastDirection = sketch.Settings.layerSettingForKey(document.selectedPage, 'lastDirection') || null
  let lastPosition = sketch.Settings.layerSettingForKey(document.selectedPage, 'lastPosition') || {x: 100, y: 100}
  const lastLineId = sketch.Settings.layerSettingForKey(document.selectedPage, 'lastLineId')
  let lastLine = lastLineId ? document.getLayerWithID(lastLineId) : null

  if (lastDirection && direction !== lastDirection || !lastLine) {
    lastLine = new sketch.ShapePath({
      frame: {
        ...lastPosition,
        width: 1,
        height: 1
      },
      parent: document.selectedPage,
      style: {
        fills: ['#FF888888'],
        borders: []
      }
    })
    sketch.Settings.setLayerSettingForKey(document.selectedPage, 'lastLineId', lastLine.id)
  }

  sketch.Settings.setLayerSettingForKey(document.selectedPage, 'lastDirection', direction)

  switch (direction) {
    case 'left': {
      lastLine.frame.x -= value
      lastLine.frame.width += value
      lastPosition.x -= value
      break
    }
    case 'right': {
      lastLine.frame.width += value
      lastPosition.x += value
      break
    }
    case 'up': {
      lastLine.frame.y -= value
      lastLine.frame.height += value
      lastPosition.y -= value
      break
    }
    case 'down': {
      lastLine.frame.height += value
      lastPosition.y += value
      break
    }
    default: {
      throw new Error('unknown direction')
    }
  }

  sketch.Settings.setLayerSettingForKey(document.selectedPage, 'lastPosition', lastPosition)
}

const knobWidth = 80
const knobHeight = 80

const commonOptions = {
  width: knobWidth,
  height: knobHeight,
  show: false,
  alwaysOnTop: true,
  transparent: true,
  frame: false,
  resizable: false,
  movable: false,
  acceptFirstMouse: true,
  hasShadow: false,
  backgroundColor: 'transparent',
  webPreferences: {
    devTools: process.env.NODE_ENV !== 'production'
  }
}

export default function() {
  const existingKnobs = [
    BrowserWindow.fromId('sketch-a-sketch.vertical'),
    BrowserWindow.fromId('sketch-a-sketch.horizontal')
  ]

  // close windows if opened
  if (existingKnobs[0]) {
    existingKnobs[0].close()
    existingKnobs[1].close()
    return
  }

  const document = sketch.getSelectedDocument()
  const contentFrame = getContentFrame(document)

  const verticalKnobOptions = {
    ...commonOptions,
    identifier: 'sketch-a-sketch.vertical',
    y: contentFrame.y + contentFrame.height - knobHeight + 32,
    x: contentFrame.x + 4,
  }

  var verticalKnob = new BrowserWindow(verticalKnobOptions)

  // only show the window when the page has loaded
  verticalKnob.once('ready-to-show', () => {
    verticalKnob.show()
  })

  verticalKnob.webContents.on('moveCursor', moveCursor)

  verticalKnob.loadURL(require('../resources/webview-vertical.html'))

  const horizontalKnobOptions = {
    ...commonOptions,
    identifier: 'sketch-a-sketch.horizontal',
    y: contentFrame.y + contentFrame.height - knobHeight + 32,
    x: contentFrame.x + contentFrame.width - knobWidth - 4,
  }

  var horizontalKnob = new BrowserWindow(horizontalKnobOptions)

  // only show the window when the page has loaded
  horizontalKnob.once('ready-to-show', () => {
    horizontalKnob.show()
  })

  horizontalKnob.webContents.on('moveCursor', moveCursor)

  horizontalKnob.loadURL(require('../resources/webview-horizontal.html'))
}
