import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import WebViewer, {UI, WebViewerInstance} from "@pdftron/webviewer";
import ImagesToPDF from '@coderosh/images-to-pdf'
import {forkJoin} from "rxjs";


export interface Document {
  name: string;
  pages: DocumentPage[]
}

export interface DocumentPage {
  number: number;
  imageUrl: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'WebView';
export class AppComponent implements AfterViewInit{
  @ViewChild('viewer') viewerRef!: ElementRef;

  wvInstance!: WebViewerInstance;

  ngAfterViewInit(): void {
    WebViewer({
      path: '../assets/lib',
      initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf',
      fullAPI: true,
    }, this.viewerRef.nativeElement).then((instance: WebViewerInstance): void => {

      this.wvInstance = instance;

      const { documentViewer} = instance.Core;
      instance.UI.setLayoutMode(instance.UI.LayoutMode.Single);

}
