import { Component } from '@angular/core';
import {
  TreeItemDropEvent,
  DropPosition
} from '@progress/kendo-angular-treeview';

@Component({
  selector: 'my-app',
  template: `
    <div class="example-config">
      <input
        type="checkbox"
        id="allow-copy"
        class="k-checkbox"
        name="allow-copy"
        [(ngModel)]="allowCopy"
      />
      <label for="allow-copy" class="k-checkbox-label">
        <strong>Allow Copy</strong> (hold the CTRL key on drop to copy the
        dragged item)
      </label>
    </div>
    <div class="example-container">
      <div>
        <h5>Product Generation</h5>
        <kendo-treeview
          #listA
          [dropZoneTreeViews]="[listB]"
          kendoTreeViewHierarchyBinding
          [childrenField]="'items'"
          kendoTreeViewDragAndDrop
          [allowCopy]="allowCopy"
          kendoTreeViewDragAndDropEditing
          emptyItemPlaceholder
          kendoTreeViewExpandable
          [expandBy]="'id'"
          [textField]="'text'"
          [nodes]="furnishing"
          [expandedKeys]="[1, 5]"
          (nodeDrop)="handleDrop($event)"
        >
          <ng-template kendoTreeViewNodeTemplate let-dataItem>
            {{ dataItem.text }}
            <span  [ngClass]="iconClass(dataItem)" *ngIf="dataItem.isuser === true"></span>
          </ng-template>
        </kendo-treeview>
      </div>

      <div>
        <div>
          <h5>Users</h5>
          <kendo-treeview
            #listB
            [dropZoneTreeViews]="[listA]"
            kendoTreeViewHierarchyBinding
            [childrenField]="'items'"
            kendoTreeViewDragAndDrop
            [allowCopy]="allowCopy"
            kendoTreeViewDragAndDropEditing
            emptyItemPlaceholder
            kendoTreeViewExpandable
            [expandBy]="'id'"
            [textField]="'text'"
            [nodes]="maintenance"
            [expandedKeys]="[9, 13]"
            (nodeDrop)="handleDrop($event)"
          >
          </kendo-treeview>
        </div>
        <div style="margin-top:50px;">
          <h5>Generations</h5>
          <kendo-treeview
            #listC
            [dropZoneTreeViews]="[listA]"
            kendoTreeViewHierarchyBinding
            [childrenField]="'items'"
            kendoTreeViewDragAndDrop
            [allowCopy]="allowCopy"
            kendoTreeViewDragAndDropEditing
            emptyItemPlaceholder
            kendoTreeViewExpandable
            [expandBy]="'id'"
            [textField]="'text'"
            [nodes]="generation"
            [expandedKeys]="[9, 13]"
            (nodeDrop)="handleDrop($event)"
          >
          </kendo-treeview>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .example-container {
        display: flex;
      }
      .example-container > div {
        flex: 1;
      }
    `
  ]
})
export class AppComponent {
  public allowCopy = true;

  public furnishing: any[] = [
    {
      id: 1,
      text: 'PASCAL (Edwards, MR, Reduction)',
      items: [
        {
          id: 2,
          text: 'G1',
          items: [{ id: 4, text: 'View' }, { id: 5, text: 'Edit', items:[{id:15, text:'Derek', isuser:true}] }]
        },
        {
          id: 3,
          text: 'G2',
          items: [{ id: 6, text: 'View' }, { id: 7, text: 'Edit' }]
        }
      ]
    },
    {
      id: 8,
      text: 'PASCAL (Abbot, MR, Reduction)',
      items: [
        {
          id: 9,
          text: 'G1',
          items: [{ id: 10, text: 'View' }, { id: 11, text: 'Edit' }]
        },
        {
          id: 12,
          text: 'G2',
          items: [{ id: 13, text: 'View' }, { id: 14, text: 'Edit' }]
        }
      ]
    }
  ];

  public maintenance: any[] = [
    { id: 13, text: 'Derek', isuser:true },
    { id: 13, text: 'Ijaz', isuser:true },
    { id: 13, text: 'Umair', isuser:true },
    { id: 13, text: 'Faisal', isuser:true }
  ];

  public generation: any[] = [
    { id: 13, text: 'G1' },
    { id: 13, text: 'G2' },
    { id: 13, text: 'G3' },
    { id: 13, text: 'G4' }
  ];

  public handleDrop(event: TreeItemDropEvent): void {
    // prevent the default to prevent the drag-and-drop directive from emitting `addItem` and inserting items with duplicate IDs
    if (this.allowCopy && event.originalEvent.ctrlKey) {
      event.preventDefault();

      // clone the item and its children and assign them new IDs
      const itemWithNewId = this.assignNewIds(
        event.sourceItem.item.dataItem,
        'id',
        'items'
      );

      // if the target is an empty placeholder, remove it and push the new item to the destination tree nodes
      if (event.destinationItem.item.dataItem.placeholder) {
        const placeholderItemIndex = event.destinationTree.nodes.indexOf(
          event.destinationItem.item.dataItem
        );
        event.destinationTree.nodes.splice(
          placeholderItemIndex,
          1,
          itemWithNewId
        );
        return;
      }

      // manually insert the new item and its children at the targeted position
      if (event.dropPosition === DropPosition.Over) {
        event.destinationItem.item.dataItem.items =
          event.destinationItem.item.dataItem.items || [];
        event.destinationItem.item.dataItem.items.push(itemWithNewId);

        if (
          !event.destinationTree.isExpanded(
            event.destinationItem.item.dataItem,
            event.destinationItem.item.index
          )
        ) {
          event.destinationTree.expandNode(
            event.destinationItem.item.dataItem,
            event.destinationItem.item.index
          );
        }
      } else {
        const parentChildren: any[] = event.destinationItem.parent
          ? event.destinationItem.parent.item.dataItem.items
          : event.destinationTree.nodes;

        const shiftIndex = event.dropPosition === DropPosition.After ? 1 : 0;
        const targetIndex =
          parentChildren.indexOf(event.destinationItem.item.dataItem) +
          shiftIndex;

        parentChildren.splice(targetIndex, 0, itemWithNewId);
      }
    }
  }

  // recursively clones and assigns new ids to the root level item and all its children
  private assignNewIds(item: any, idField: string, childrenField: string): any {
    const result = Object.assign({}, item, { [idField]: Math.random() });

    if (result[childrenField] && result[childrenField].length) {
      result[childrenField] = result[childrenField].map(childItem =>
        this.assignNewIds(childItem, idField, childrenField)
      );
    }

    return result;
  }

  public iconClass({ text, items }: any): any {
    return {
        'k-i-delete': true,
        'k-icon': true
    };
}
}
