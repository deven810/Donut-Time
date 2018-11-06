window.Assignment_Two_Test = window.classes.Assignment_Two_Test =
class Assignment_Two_Test extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { 
                         sun: new Subdivision_Sphere(4),
                         planet_1: new (Subdivision_Sphere.prototype.make_flat_shaded_version() )(2),
                         planet_2: new Subdivision_Sphere(3),
                         planet_3: new Subdivision_Sphere(4),
                         fatRing: new Torus( 15, 15 ),
                         planet_4: new Subdivision_Sphere(4),
                         moon: new (Subdivision_Sphere.prototype.make_flat_shaded_version() )(1),
                         thinRing: new Torus2(25, 30), //finer rings defined in dependencies.js
                         planet_5: new weirdSphere(6,6)
                       }
        this.submit_shapes( context, shapes );
                                     
                                     // Make some Material objects available to you:
        this.materials =
          { test:     context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient:.2 } ),
            ring:     context.get_instance( Ring_Shader  ).material(),
            sun:      context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient:1 } ),
            planet_1:   context.get_instance( Phong_Shader ).material( Color.of(190/256,195/256,200/256,1), { ambient:0, specularity:0} ),
            planet_2:   context.get_instance( Phong_Shader ).material( Color.of(6/256,79/256,64/256,1), { ambient:0, specularity:1, diffusivity:.3, gouraud:1} ),
            planet_3:   context.get_instance( Phong_Shader ).material( Color.of(192/256,147/256,114/256,1), { ambient:0, specularity:1, diffusivity:1} ),
            planet_4:   context.get_instance( Phong_Shader ).material( Color.of(17/256,30/256,108/256,1), { ambient:0, specularity:1, diffusivity:.5 } ),
            planet_5:   context.get_instance( Phong_Shader ).material( Color.of(190/256,195/256,200/256,1), { ambient:0, specularity:1, diffusivity:1} )
          }

        this.lights = [ new Light( Vec.of( 0,0,0,1 ), Color.of( 0, 0, 1, 1 ), 1000 )];
        this.planet_1;
        this.planet_2;
        this.planet_3;
        this.planet_4;
        this.planet_5;
        this.moon;
      }
    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { this.key_triggered_button( "View solar system",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "Attach to planet 1", [ "1" ], () => this.attached = () => this.planet_1 );
        this.key_triggered_button( "Attach to planet 2", [ "2" ], () => this.attached = () => this.planet_2 ); this.new_line();
        this.key_triggered_button( "Attach to planet 3", [ "3" ], () => this.attached = () => this.planet_3 );
        this.key_triggered_button( "Attach to planet 4", [ "4" ], () => this.attached = () => this.planet_4 ); this.new_line();
        this.key_triggered_button( "Attach to planet 5", [ "5" ], () => this.attached = () => this.planet_5 );
        this.key_triggered_button( "Attach to moon",     [ "m" ], () => this.attached = () => this.moon     );
      }
    orbitOfPlanet(model_transform, atRadius, t) {
      return            model_transform.times(Mat4.translation([-1*atRadius,0,0]))
                                       .times(Mat4.rotation(5*t/atRadius, Vec.of(0,1,0)))
                                       .times(Mat4.translation([atRadius,0,0]))
    }
    display( graphics_state )
      { 
//         this.lights[0].color = Color.of(changeColor, 0, 1-changeColor,1);
//         this.lights[0].size = 10 ** a;
//         graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();
        let distancefromcentre = 0;
        const initalDistance = 5;
        const planetDistance = 3; 
        
        // Sun
        let a = 2 + Math.sin(2*Math.PI*t/5);
        let changeColor = (a-1)/2; 
        let sunlight = new Light( Vec.of( 0,0,0,1 ), Color.of(changeColor, 0, 1-changeColor,1), 10 ** a )
        graphics_state.lights = [sunlight];
         

        //EDDDDIIIITTTT!!!!!


        this.shapes.sun.draw(graphics_state, model_transform.times(Mat4.scale([a,a,a])), this.materials.sun.override({color:Color.of(changeColor,0,1-changeColor,1)}))

        //Planet 1
        distancefromcentre += initalDistance; 
        model_transform = model_transform.times(Mat4.translation([5,0,0]));
        this.planet_1=this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(t, Vec.of(0,1,0)));
        this.shapes.planet_1.draw(graphics_state, this.planet_1, this.materials.planet_1);

        //Planet 2
        distancefromcentre += planetDistance; 
        model_transform = model_transform.times(Mat4.translation([3,0,0]));
        if(Math.floor(t)%2==0)
          this.shapes.planet_2.draw(graphics_state, this.planet_2=this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(2*t, Vec.of(0,1,0))), this.materials.planet_2.override({gouraud:0}));
        else 
          this.shapes.planet_2.draw(graphics_state, this.planet_2=this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(2*t, Vec.of(0,1,0))), this.materials.planet_2);

        //Planet 3
        distancefromcentre += planetDistance; 
        model_transform = model_transform.times(Mat4.translation([3,0,0]));
        this.shapes.planet_3.draw(graphics_state, this.planet_3 = this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(2*t, Vec.of(0,1,.4))), this.materials.planet_3);
//         this.shapes.fatRing.draw(graphics_state, this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(2*t, Vec.of(0,1,.4))).times(Mat4.scale([1,1,.25])), this.materials.planet_3);
//         this.shapes.planet_3.draw(graphics_state, this.planet_3 = this.orbitOfPlanet(model_transform, distancefromcentre, t), this.materials.planet_3);
        this.shapes.thinRing.draw(graphics_state, this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(2*t, Vec.of(0,1,.4))).times(Mat4.scale([.6,.6,1])), this.materials.ring);
        this.shapes.thinRing.draw(graphics_state, this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(2*t, Vec.of(0,1,.4))).times(Mat4.scale([.8,.8,1])), this.materials.ring);
        this.shapes.thinRing.draw(graphics_state, this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(2*t, Vec.of(0,1,.4))).times(Mat4.scale([1.2,1.2,1])), this.materials.ring);
        this.shapes.thinRing.draw(graphics_state, this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(2*t, Vec.of(0,1,.4))).times(Mat4.scale([1,1,1])), this.materials.ring);

        //Planet 4
        distancefromcentre += planetDistance; 
        model_transform = model_transform.times(Mat4.translation([3,0,0]));
        this.shapes.planet_4.draw(graphics_state, this.planet_4 = this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(2*t, Vec.of(0,1,0))), this.materials.planet_4);
        this.shapes.moon.draw(graphics_state, this.moon = this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(3*t, Vec.of(0,1,0))).times(Mat4.translation([2,0,0])), this.materials.planet_1);
  
        distancefromcentre += planetDistance; 
        model_transform = model_transform.times(Mat4.translation([3,0,0]));
        this.shapes.planet_5.draw(graphics_state, this.planet_5 = this.orbitOfPlanet(model_transform, distancefromcentre, t).times(Mat4.rotation(2*t, Vec.of(0,1,0))), this.materials.planet_5);
  
        if(typeof(this.attached) == "function") {
          var data = Mat4.inverse(this.attached().times(Mat4.translation([0,0,5])));
//           console.log(data)
//          console.log(Mat4.inverse(data))
          graphics_state.camera_transform = data.map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1) ); 
        }
      }
  }


// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             // names.  Map those names onto the arrays we'll pull them from.  This determines
                                                  // which kinds of Shapes this Shader is compatible with.  Thanks to this function, 
                                                  // Vertex buffers in the GPU can get their pointers matched up with pointers to 
                                                  // attribute names in the GPU.  Shapes and Shaders can still be compatible even
                                                  // if some vertex data feilds are unused. 
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
         gl_Position = projection_camera_transform * model_transform * vec4(object_space_pos, 1.0); 
          
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        { 
           vec4 color = vec4(.75,.575,.445,1.0);
           float d = (sin(distance(position, center))+1.0)/2.0;
           gl_FragColor = vec4(color.xyz * d, 1.0);
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    }
}

window.Grid_Sphere = window.classes.Grid_Sphere =
class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at 
  { constructor( rows, columns, texture_range )             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
      { super( "positions", "normals", "texture_coords" );
        

                      // TODO:  Complete the specification of a sphere with lattitude and longitude lines
                      //        (Extra Credit Part III)
      } }