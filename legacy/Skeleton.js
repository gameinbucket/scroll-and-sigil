class Bone
{
	constructor()
	{
		this.root;
		this.leafs;
		this.weight;
		this.length;
		this.planeOffsetX;
		this.planeOffsetY;
		this.boneOffsetX;
		this.boneOffsetY;
		this.localRotation;
		this.aggregateRotation;
		this.worldX;
		this.worldY;
	}
    static Recurse(buffer)
    {

	}
}
class Model
{
	constructor()
	{
		this.bones = [];
		this.animations= [];
	}
}