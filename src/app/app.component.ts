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


      instance.UI.setHeaderItems((header: UI.Header): void => {
        header.push({
          type: 'customElement',
          class: 'custom',
          render: renderLoadButton
        });
      });

      instance.UI.addEventListener(instance.UI.Events.FILE_DOWNLOADED, () => {
        console.log(documentViewer.getAnnotationManager().getAnnotationsList().map(object=> {
          return {
            type: object.Subject,
            page: object.PageNumber,
            value: object.getContents(),
            originalValue: object
          }
        }))
      });

      function renderLoadButton (): HTMLDivElement {

        const container: HTMLDivElement = document.createElement('div');
        container.setAttribute('style', `
          width: 32px;
          height: 32px;
          margin: 0 10px;
          overflow: hidden;
          background-image: url('https://png.pngtree.com/element_our/20190601/ourmid/pngtree-file-upload-icon-image_1344393.jpg');
          background-size: cover;
          border-radius: 3px;
        `)

        const loadButton: HTMLInputElement = document.createElement('input');
        loadButton.setAttribute('style', `
          width: 32px;
          height: 32px;
          opacity: 0;
        `)
        loadButton.type = 'file';
        loadButton.className = 'loadButton';
        loadButton.onchange= (event: Event): void => {

          const fileList: FileList = (event.target as HTMLInputElement).files as FileList;

          if(fileList[0].type === 'application/json'){

            const fileReader: FileReader = new FileReader();
            fileReader.onload = (): void=>{
              const files: Document = JSON.parse(fileReader.result as string)
              forkJoin(files.pages.map((page: DocumentPage)=>fetch(`../assets/view/${page.imageUrl}`)))
                  .subscribe((pages: Response[]): void=>{

                    forkJoin(pages.map((page: Response)=>page.arrayBuffer()))
                        .subscribe((pagesData: ArrayBuffer[]): void=>{

                          const imgToPdf: ImagesToPDF = new ImagesToPDF([...pagesData])

                          imgToPdf.createPdf().then(pdf=>{
                            instance.UI.loadDocument(pdf.dataUrl(), {extension: 'pdf'})
                          })
                        })
                  });
            }
            fileReader.readAsText(fileList[0])
          } else {
            instance.UI.loadDocument(fileList[0])
          }
        }

        container.appendChild(loadButton)
        return container;
      }

    })
  }

}
