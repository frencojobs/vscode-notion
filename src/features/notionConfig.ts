import * as vscode from 'vscode'

export default class NotionConfig {
  private static readonly key = 'VSCodeNotion'

  public readonly api: string
  public readonly accessToken: string
  public readonly fontFamily: string
  public readonly fontSize: number
  public readonly lineHeight: number

  constructor() {
    const config = vscode.workspace.getConfiguration(NotionConfig.key)

    this.api = config.get<string>('api')!
    this.accessToken = config.get<string>('accessToken')!
    this.fontSize = config.get<number>('fontSize')!
    this.fontFamily = config.get<string>('fontFamily')!
    this.lineHeight = config.get<number>('lineHeight')!
  }
}
