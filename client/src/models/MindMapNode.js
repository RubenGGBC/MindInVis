class MindMapNode{
    constructor(id,text,x,y,tipo,parent=null){
      this.id = id;
      this.text = text;
      this.x = x;
      this.y = y;
      this.parent = parent;
      this.children = [];
      this.tipo=tipo
    }
    addChild(text,offsetX,offsetY,tipo){
        const childNode=new MindMapNode(
          `node-${Date.now()}`,
        text,
        this.x + offsetX,
        this.y + offsetY,
        tipo,
        this
      );
      this.children.push(childNode);
      return childNode;
    }
    addChilden(texts){
        texts.forEach((text,index)=>{
            this.addChild(text,StartX+(index*spacing)-this.x,150)
        })

    }
    toJSON(){
        return {
        id: this.id,
        text: this.text,
        x: this.x,
        y: this.y,
        children: this.children.map(child => child.toJSON())
      };
    }
    static fromJSON(data, parent = null) {
      const node = new MindMapNode(data.id, data.text, data.x, data.y, parent);
      node.children = data.children.map(childData =>
        MindMapNode.fromJSON(childData, node)
      );
      return node;
    }
  }

  export default MindMapNode;
