import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  HemisphericLight,
  ArcRotateCamera,
  DirectionalLight,
  Vector4,
  Space,
  ActionManager,
  ExecuteCodeAction,
  Mesh,
  Texture,
  Axis,
  SolidParticleSystem
} from '@babylonjs/core'
const createScene = (canvas) => {
  const engine = new Engine(canvas)
  const scene = new Scene(engine)

  var camera = new ArcRotateCamera('camera1',  0, 0, 20 ,new Vector3(0, 0, 0), scene)
  camera.setPosition(new Vector3(11.5, 3.5, 0))

  new HemisphericLight("lightH", new Vector3(1,1, 0), scene)
  new DirectionalLight("lightD", new Vector3(1, 3, 1), scene)
  new DirectionalLight("lightD", new Vector3(10, 3, 5), scene)
  

  var bodyMaterial = new StandardMaterial("body_mat", scene);
  bodyMaterial.diffuseColor = new Color3(1, 0, 0);
  bodyMaterial.backFaceCulling = false;


  var side = [new Vector3(-5, 2, -2),
    new Vector3(3, 2, -2),
    new Vector3(3, 0.75, -2),
    new Vector3(-9.5, 0.75, -2)				
];

    side.push(side[0]);

    var extPath = [new Vector3(0, 0, 0), new Vector3(0, 0, 4)];

    //CarBody
	var carBody = MeshBuilder.ExtrudeShape("carbody", {shape: side, path: extPath, cap : Mesh.CAP_ALL}, scene);
	carBody.material = bodyMaterial;
	camera.parent = carBody;
	 
	var carWheelMaterial = new StandardMaterial("wheelMat", scene);
    
  	var carWheelTexture = new Texture("https://i.imgur.com/a/W7jZMw0.png", scene);
	carWheelMaterial.diffuseTexture = carWheelTexture;
	

	var faceColors=[];
	faceColors[1] = new Color3(0.22, 0.5, 0.78);

    var faceUV =[];
	faceUV[0] = new Vector4(3,2,1,1);
	faceUV[2] = new Vector4(3,2,1,1);
	
	var wheelF1 = MeshBuilder.CreateCylinder("wheelF1", {diameter: 3, height: 1, tessellation: 24, faceColors:faceColors, faceUV:faceUV}, scene);
  	wheelF1.material = carWheelMaterial;
	
  	wheelF1.rotate(Axis.X, Math.PI/2, Space.WORLD); 	

	//pivot points

    var pivotF = new Mesh("pivotF", scene);
  pivotF.parent = carBody;
  pivotF.position = new Vector3(-6.5, 0, -2);
  
  var pivotS = new Mesh("pivotS", scene);
  pivotS.parent = carBody;
  pivotS.position = new Vector3(-6.5, 0, 2);  
 
// Wheels 
  var wheelF2 = wheelF1.createInstance("F2");
  wheelF2.parent = pivotS;
  wheelF2.position = new Vector3(0, 0, 1.8);
  
  var wheelS1 = wheelF1.createInstance("S1");
  wheelS1.parent = carBody;
  wheelS1.position = new Vector3(0, 0, -2.8);
  
  var wheelS2 = wheelF1.createInstance("S2");
  wheelS2.parent = carBody;
  wheelS2.position = new Vector3(0, 0, 2.8);
  
  wheelF1.parent = pivotF;
  wheelF1.position = new Vector3(0, 0, -1.8);

  var pivot = new Mesh("pivot", scene); 
  pivot.position.z = 50;
  carBody.parent = pivot;
  carBody.position = new Vector3(0, 0, -50);
  
   var groundSize = 600;
  
  var ground = MeshBuilder.CreateGround("ground", {width: groundSize, height: groundSize}, scene);
  var groundMaterial = new StandardMaterial("ground", scene);
  groundMaterial.diffuseColor = new Color3(0.78, 0.78, 0.78);
  ground.material = groundMaterial;
  ground.position.y = -1.5;

  var box = MeshBuilder.CreateBox("box", {
       size: 5,
       height: 25,
  }, scene);
  box.position = new Vector3(20, 0, 10);
  

 var boxesSPS = new SolidParticleSystem("boxes", scene, {updatable: false});
    
    var set_boxes = function(particle, i, s) {
        particle.position = new Vector3(-200 + Math.random()*400, 0, -200 + Math.random()*400); 
    }
    
    boxesSPS.addShape(box, 50, {positionFunction:set_boxes});  
    var boxes = boxesSPS.buildMesh(); 
	boxes.material = new StandardMaterial("box-material", scene);
	boxes.material.alpha = 0.25;

  const material = new StandardMaterial('box-material', scene)
//   material.diffuseColor = Color3.White()
  var buildText = new Texture("https://i.imgur.com/a/UAEbg0Q.png", scene);
  material.diffuseTexture = buildText
  boxes.material = material

   //  Controls

 var map ={};
 scene.actionManager = new ActionManager(scene);

 scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {								
       map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
       
   }));
   
 scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {								
       map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
   }));	

    var theta = 0;
    var deltaTheta = 0;
    var D = 0; //distance translated per second
    var R = 60; //turning radius, initial set at pivot z value
    var NR; //Next turning radius on wheel turn
    var A = 10; // axel length
    var L = 10; //distance between wheel pivots
    var r = 1.5; // wheel radius
    var psi, psiS1, psiS2, psiF1, psiF2; //wheel rotations  
    var phi; //rotation of car when turning 
    
    var F; // frames per second	
 
//   animation
scene.registerAfterRender(function() {	
    F = engine.getFps();
    
    if(map[" "]  && D < 15 ) {
        D += 1;		
    };
    
    if(D > 0.15) {
        D -= 0.15;
    } 
    else {
        D = 0;
    }
                
    var distance = D/F;
    psi = D/(r * F);
    
    if((map["a"] || map["A"]) && -Math.PI/6 < theta) {
        deltaTheta = -Math.PI/252;
        theta += deltaTheta;
        pivotF.rotate(Axis.Y, deltaTheta, Space.LOCAL);
        pivotS.rotate(Axis.Y, deltaTheta, Space.LOCAL);
        if(Math.abs(theta) > 0.00000001) {
            NR = A/2 +L/Math.tan(theta);	
        }
        else {
            theta = 0;
            NR = 0;
        }
        pivot.translate(Axis.Z, NR - R, Space.LOCAL);
        carBody.translate(Axis.Z, R - NR, Space.LOCAL);
        R = NR;
                                
    };
        
    if((map["d"] || map["D"])  && theta < Math.PI/6) {
        deltaTheta = Math.PI/252;
        theta += deltaTheta;
        pivotF.rotate(Axis.Y, deltaTheta, Space.LOCAL);
        pivotS.rotate(Axis.Y, deltaTheta, Space.LOCAL);
        if(Math.abs(theta) > 0.00000001) {
            NR = A/2 +L/Math.tan(theta);	
        }
        else {
            theta = 0;
            NR = 0;
        }
        pivot.translate(Axis.Z, NR - R, Space.LOCAL);
        carBody.translate(Axis.Z, R - NR, Space.LOCAL);
        R = NR;
                
    };
    
    if(D > 0) {
        phi = D/(R * F);
        if(Math.abs(theta)>0) {	 
             pivot.rotate(Axis.Y, phi, Space.WORLD);
            psiS1 = D/(r * F);
            psiS2 = D * (R + A)/(r * F);
            psiF1 = D * Math.sqrt(R* R + L * L)/(r * F);
            psiF2 = D * Math.sqrt((R + A) * (R + A) + L * L)/(r * F);
        
            wheelF1.rotate(Axis.Y, psiF1, Space.LOCAL); 
             wheelF2.rotate(Axis.Y, psiF2, Space.LOCAL);
             wheelS1.rotate(Axis.Y, psiS1, Space.LOCAL);
             wheelS2.rotate(Axis.Y, psiS2, Space.LOCAL);
         }
         else {
             pivot.translate(Axis.X, -distance, Space.LOCAL);
            wheelF1.rotate(Axis.Y, psi, Space.LOCAL); 
             wheelF2.rotate(Axis.Y, psi, Space.LOCAL);
             wheelS1.rotate(Axis.Y, psi, Space.LOCAL);
             wheelS2.rotate(Axis.Y, psi, Space.LOCAL);
         }
    }
});

    

  engine.runRenderLoop(() => {
    scene.render()
  })
}

export { createScene }
