/////////////////////////////////////////////////////////////////////////
// Pixel shader for the final pass
//
// Copyright 2013 DigiPen Institute of Technology
////////////////////////////////////////////////////////////////////////
#version 330

uniform int mode;               // 0..9, used for debugging
uniform bool direct;            // Direct color -- no lighting calculation

uniform vec3 diffuse;
uniform vec3 specular;
uniform float shininess;

uniform vec3 lightValue, lightAmbient;

uniform sampler2D groundTexture;
uniform sampler2D tex;
uniform sampler2D topReflectionTexture;
uniform sampler2D bottomReflectionTexture;

uniform float isCentralModel;



in vec3 normalVec, lightVec;
in vec3 eyeVec;
in vec2 texCoord;
in vec3 worldPos;




float PI = 3.14159;

float LN(vec3 light, vec3 normal)
{
return max(dot(light, normal), 0.0);
}





vec3 BRDF(vec3 eye, vec3 normal, vec3 light, vec3 dif, vec3 spec, float shiny)
{

float alpha = pow(8192, shiny);



	vec3 V = normalize(eye);
    vec3 N = normalize(normal);
    vec3 L = normalize(light);
	vec3 H = normalize(L+V);

	float LN = max(dot(L,N), 0.0);
	float HN = max(dot(H,N), 0.0);
	float LH = max(dot(L,H), 0.0);

	vec3 mySpec;// = (1-specular.x, 1-specular.y, 1-specular.z); 
	mySpec.x = 1-spec.x;
	mySpec.y=1-spec.y;
	mySpec.z=1-spec.z;
	vec3 F = spec + (mySpec)*(pow((1-LH), 5));
	float D = ((alpha+2)/(2*PI))*(pow(HN, alpha)); 
	
	//Using approx of G() / (LN * VN) = approx  1/(LH*LH)

	vec3 BRDF = (F*D)/(4*LH*LH) + (dif / PI);
	
	return BRDF;


}


vec3 BRDF( vec3 dif, vec3 spec, float shiny)
{
return BRDF(eyeVec, normalVec, lightVec, dif, spec, shiny);
}

void main()
{







float PI = 3.14159;

    vec3 N = normalize(normalVec);
    vec3 L = normalize(lightVec);
	vec3 V = normalize(eyeVec);
	

	float LN = max(dot(L,N), 0.0);
	vec3 R = 2*dot(V,N)*N - V;
	vec3 RNorm = normalize(R);
	vec3 centerOfReflection = vec3(0.0, 0.0, 0.0);

vec3 t = BRDF(eyeVec, normalVec, lightVec, diffuse, specular, shininess);
vec3 output = t * LN * lightValue;	

float LNReal = dot(L,N);
vec3 white = vec3(1.0f, 1.0f, 1.0f);



	    if (textureSize(groundTexture,0).x>1) // Is the texture defined?
        {
		
		vec3 temp = BRDF(texture(groundTexture,2.0*texCoord.st).xyz, specular, shininess);
		gl_FragColor.xyz = temp;
		
		}
		



		
			else if(isCentralModel == -1)
				{
				
					
					vec3 textureColor; //The color at the texture coord
					float depth = RNorm.z; 
					vec2 texCoord; // = (0.5)*vec2(RNorm.x/depth +1, RNorm.y/depth +1);
					float RN = max(dot(RNorm,N),0.0);
					if(worldPos.z <0)
					{
					depth = 1-depth;
					texCoord = vec2(0.5*RNorm.x/depth +0.5 , 0.5*RNorm.y/depth + 0.5);
					//textureColor = BRDF(texture(bottomReflectionTexture, texCoord.xy).xyz, specular, shininess);
					textureColor = texture(bottomReflectionTexture, vec2(0.0, 0.0)).xyz;
					
					gl_FragColor.xyz = textureColor;
					if(textureColor.x==textureColor.y && textureColor.z == textureColor.x && textureColor.x==0)
					{
						//gl_FragColor.xyz = white;
					}
	
				gl_FragColor.xyz = (BRDF(eyeVec, normalVec, lightVec,diffuse, specular, shininess))*LN*(lightValue) + (textureColor*RN*BRDF((R), normalVec, R, diffuse, specular, shininess));
				
		
				
				}

					else
					{depth = 1+depth;
					texCoord = vec2(RNorm.x/(2*depth) +0.5, RNorm.y/(depth*2) +0.5);
					textureColor = texture(topReflectionTexture, texCoord.xy).xyz;
					
				
				gl_FragColor.xyz = (BRDF(eyeVec, normalVec, lightVec,diffuse, specular, shininess))*LN*(lightValue) + (textureColor*RN*BRDF((R), normalVec, R, diffuse, specular, shininess));
				//gl_FragColor.xyz = textureColor;


				

					
					}
						
					/*	
					gl_FragColor.xyz=vec3(1.0, 0.5, 0.0);
				

					if(textureSize(bottomReflectionTexture, 0).x>1)// || textureSize(bottomReflectionTexture, 0) < 1024)
					{gl_FragColor.xyz=vec3(0.0, 1.0, 0.0);}
					else
					{gl_FragColor.xyz=vec3(1.0, 0.0, 0.0);}
			*/
			
			
			}
			else
			{
			
			gl_FragColor.xyz = output;

			}
				


	   

	   }